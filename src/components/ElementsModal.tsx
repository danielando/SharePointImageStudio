import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Trash2, Plus } from 'lucide-react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { Element } from '../types'

export default function ElementsModal() {
  const {
    showElementsModal,
    setShowElementsModal,
    elements,
    addElement,
    updateElement,
    deleteElement,
    editingElement,
    setEditingElement,
    userId
  } = useStore()

  const [name, setName] = useState('')
  const [color, setColor] = useState('#8B5CF6')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingElement) {
      setName(editingElement.name)
      setColor(editingElement.color)
      setImageUrl(editingElement.image_url)
      setPreviewUrl(editingElement.image_url)
    } else {
      resetForm()
    }
  }, [editingElement])

  const resetForm = () => {
    setName('')
    setColor('#8B5CF6')
    setImageUrl('')
    setImageFile(null)
    setPreviewUrl('')
    setEditingElement(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setImageUrl('') // Clear URL if file is selected
    }
  }

  const handleUrlChange = (url: string) => {
    setImageUrl(url)
    if (url) {
      setPreviewUrl(url)
      setImageFile(null) // Clear file if URL is entered
    }
  }

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`

    const { error } = await supabase.storage
      .from('elements')
      .upload(fileName, file)

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('elements')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  const handleSubmit = async () => {
    if (!name.trim() || (!imageFile && !imageUrl)) {
      alert('Please provide a name and an image')
      return
    }

    if (!userId) {
      alert('You must be logged in')
      return
    }

    setIsSubmitting(true)

    try {
      let finalImageUrl = imageUrl

      // Upload file if selected
      if (imageFile) {
        finalImageUrl = await uploadImageToSupabase(imageFile)
      }

      if (editingElement) {
        // Update existing element
        const { error } = await supabase
          .from('elements')
          .update({
            name,
            image_url: finalImageUrl,
            color,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingElement.id)

        if (error) throw error

        updateElement(editingElement.id, {
          name,
          image_url: finalImageUrl,
          color,
          updated_at: new Date().toISOString()
        })
      } else {
        // Create new element
        const { data: newElement, error } = await supabase
          .from('elements')
          .insert({
            user_id: userId,
            name,
            image_url: finalImageUrl,
            color,
          })
          .select()
          .single()

        if (error) throw error

        addElement(newElement as Element)
      }

      resetForm()
    } catch (error) {
      console.error('Error saving element:', error)
      alert('Failed to save element')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this element?')) return

    try {
      const { error } = await supabase
        .from('elements')
        .delete()
        .eq('id', id)

      if (error) throw error

      deleteElement(id)

      if (editingElement?.id === id) {
        resetForm()
      }
    } catch (error) {
      console.error('Error deleting element:', error)
      alert('Failed to delete element')
    }
  }

  if (!showElementsModal) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => {
            setShowElementsModal(false)
            resetForm()
          }}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-4xl bg-charcoal-900 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-700">
            <h2 className="text-xl font-bold text-white">Elements</h2>
            <button
              onClick={() => {
                setShowElementsModal(false)
                resetForm()
              }}
              className="p-2 hover:bg-charcoal-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-charcoal-400" />
            </button>
          </div>

          <div className="flex">
            {/* Element List */}
            <div className="w-1/2 p-6 border-r border-charcoal-700 max-h-[600px] overflow-y-auto">
              <div className="space-y-2">
                {elements.length === 0 ? (
                  <div className="text-center py-12 text-charcoal-500">
                    <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No elements yet</p>
                    <p className="text-sm mt-1">Create your first element to get started</p>
                  </div>
                ) : (
                  elements.map(element => (
                    <motion.div
                      key={element.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg
                        cursor-pointer transition-colors
                        ${editingElement?.id === element.id
                          ? 'bg-charcoal-700 ring-2 ring-purple-500'
                          : 'bg-charcoal-800 hover:bg-charcoal-700'
                        }
                      `}
                      onClick={() => setEditingElement(element)}
                      whileHover={{ scale: 1.01 }}
                    >
                      <img
                        src={element.image_url}
                        alt={element.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-white">{element.name}</div>
                        <div
                          className="w-16 h-2 rounded mt-1"
                          style={{ backgroundColor: element.color }}
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(element.id)
                        }}
                        className="p-2 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Add/Edit Form */}
            <div className="w-1/2 p-6 max-h-[600px] overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingElement ? 'Edit Element' : 'Add New Element'}
              </h3>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-charcoal-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., companylogo"
                    className="
                      w-full px-3 py-2 bg-charcoal-800 border border-charcoal-700
                      rounded-lg text-white placeholder-charcoal-500
                      focus:outline-none focus:ring-2 focus:ring-purple-500
                    "
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-charcoal-300 mb-2">
                    Color (for visual identification)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="
                        flex-1 px-3 py-2 bg-charcoal-800 border border-charcoal-700
                        rounded-lg text-white font-mono
                        focus:outline-none focus:ring-2 focus:ring-purple-500
                      "
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-charcoal-300 mb-2">
                    Image
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="
                      border-2 border-dashed border-charcoal-700 rounded-lg
                      p-6 text-center cursor-pointer
                      hover:border-charcoal-600 transition-colors
                    "
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded mx-auto"
                      />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-charcoal-500" />
                        <p className="text-sm text-charcoal-400">
                          Click to upload or drag & drop
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-sm font-medium text-charcoal-300 mb-2">
                    Or provide a URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="
                      w-full px-3 py-2 bg-charcoal-800 border border-charcoal-700
                      rounded-lg text-white placeholder-charcoal-500
                      focus:outline-none focus:ring-2 focus:ring-purple-500
                    "
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !name.trim() || (!imageFile && !imageUrl)}
                    className="
                      flex-1 px-4 py-2 rounded-lg font-semibold
                      bg-gradient-to-r from-purple-600 to-blue-600
                      text-white
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    {isSubmitting ? 'Saving...' : editingElement ? 'Update' : 'Add Element'}
                  </button>
                  {editingElement && (
                    <button
                      onClick={resetForm}
                      className="
                        px-4 py-2 rounded-lg font-semibold
                        bg-charcoal-800 text-white
                        hover:bg-charcoal-700
                      "
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
