import { useState, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'
import { ImageReference } from '../types'

interface PromptInputProps {
  onGenerate: () => void
}

export default function PromptInput({ onGenerate }: PromptInputProps) {
  const {
    prompt,
    setPrompt,
    imageReferences,
    addImageReference,
    removeImageReference,
    elements
  } = useStore()

  const [showElementPicker, setShowElementPicker] = useState(false)
  const [, setElementPickerPosition] = useState({ top: 0, left: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onGenerate()
    }

    // Check for @ symbol to trigger element picker
    if (e.key === '@') {
      const textarea = textareaRef.current
      if (textarea) {
        const rect = textarea.getBoundingClientRect()
        const lineHeight = 24
        const lines = prompt.split('\n').length
        setElementPickerPosition({
          top: rect.top + (lines * lineHeight) + 30,
          left: rect.left + 20
        })
        setShowElementPicker(true)
      }
    }

    if (e.key === 'Escape') {
      setShowElementPicker(false)
    }
  }

  const insertElement = (elementName: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart
    const textBefore = prompt.substring(0, cursorPos)
    const textAfter = prompt.substring(cursorPos)

    // Remove the @ symbol that triggered the picker
    const beforeWithoutAt = textBefore.endsWith('@') ? textBefore.slice(0, -1) : textBefore

    const newPrompt = `${beforeWithoutAt}@${elementName} ${textAfter}`
    setPrompt(newPrompt)
    setShowElementPicker(false)

    // Refocus textarea
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = beforeWithoutAt.length + elementName.length + 2
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        const ref: ImageReference = {
          id: crypto.randomUUID(),
          url,
          file
        }
        addImageReference(ref)
      }
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className="space-y-4">
      {/* Prompt Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the image you want to generate... (Type @ to insert elements, press Enter to generate)"
          className="
            w-full h-32 px-4 py-3
            bg-charcoal-800 text-white
            border border-charcoal-700 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-purple-500
            placeholder-charcoal-500
            resize-none
          "
        />

        {/* Element Picker Dropdown */}
        <AnimatePresence>
          {showElementPicker && elements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 mt-2 w-64 bg-charcoal-800 border border-charcoal-700 rounded-lg shadow-xl overflow-hidden"
            >
              <div className="p-2 text-xs text-charcoal-400 border-b border-charcoal-700">
                Select an element
              </div>
              <div className="max-h-64 overflow-y-auto">
                {elements.map(element => (
                  <button
                    key={element.id}
                    onClick={() => insertElement(element.name)}
                    className="
                      w-full px-3 py-2 flex items-center gap-3
                      hover:bg-charcoal-700 transition-colors
                      text-left
                    "
                  >
                    <img
                      src={element.image_url}
                      alt={element.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-white">{element.name}</div>
                      <div
                        className="w-12 h-2 rounded mt-1"
                        style={{ backgroundColor: element.color }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Image References & Generate Button Row */}
      <div className="flex items-center gap-4">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            flex-1 flex items-center gap-2 px-4 py-3
            bg-charcoal-800 border-2 border-dashed rounded-lg
            transition-colors cursor-pointer
            ${isDragging
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-charcoal-700 hover:border-charcoal-600'
            }
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-5 h-5 text-charcoal-500" />
          <span className="text-sm text-charcoal-400">
            {imageReferences.length > 0
              ? `${imageReferences.length} image${imageReferences.length > 1 ? 's' : ''} added`
              : 'Add reference images (drag & drop or click)'
            }
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={onGenerate}
          disabled={!prompt.trim()}
          className="
            px-8 py-3 rounded-lg font-semibold
            bg-gradient-to-r from-purple-600 to-blue-600
            text-white shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2
          "
          whileHover={prompt.trim() ? { scale: 1.02 } : {}}
          whileTap={prompt.trim() ? { scale: 0.98 } : {}}
        >
          <Sparkles className="w-5 h-5" />
          Generate
        </motion.button>
      </div>

      {/* Image Reference Thumbnails */}
      {imageReferences.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {imageReferences.map(ref => (
            <motion.div
              key={ref.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <img
                src={ref.url}
                alt="Reference"
                className="w-20 h-20 object-cover rounded-lg border border-charcoal-700"
              />
              <button
                onClick={() => removeImageReference(ref.id)}
                className="
                  absolute -top-2 -right-2 w-6 h-6
                  bg-red-500 rounded-full
                  flex items-center justify-center
                  opacity-0 group-hover:opacity-100
                  transition-opacity
                "
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
