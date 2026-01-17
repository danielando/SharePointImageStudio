import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Trash2, ChevronLeft, ChevronRight, X, Copy, RotateCcw, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'

const LOADING_MESSAGES = [
  'Mixing pixels...',
  'Consulting the AI...',
  'Adding creativity...',
  'Painting your vision...',
  'Crafting magic...',
  'Thinking visually...',
  'Summoning pixels...',
  'Building your image...',
  'Creating art...',
  'Dreaming in code...',
]

export default function ImageCanvas() {
  const {
    generations,
    deleteGeneration,
    selectedGeneration,
    setSelectedGeneration,
    setPrompt,
    addImageReference
  } = useStore()

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)

  const [, setIsDragging] = useState(false)
  const [, setDraggedImage] = useState<string | null>(null)

  const handleDownload = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleCopyToClipboard = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      alert('Image copied to clipboard!')
    } catch (error) {
      console.error('Copy failed:', error)
      alert('Failed to copy image')
    }
  }

  const handleDragStart = (e: React.DragEvent, imageUrl: string) => {
    setIsDragging(true)
    setDraggedImage(imageUrl)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDraggedImage(null)
  }

  const navigatePreview = (direction: 'prev' | 'next') => {
    if (!selectedGeneration) return

    const currentIndex = generations.findIndex(g => g.id === selectedGeneration.id)
    let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0) newIndex = generations.length - 1
    if (newIndex >= generations.length) newIndex = 0

    setSelectedGeneration(generations[newIndex])
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedGeneration) return

    if (e.key === 'ArrowLeft') navigatePreview('prev')
    if (e.key === 'ArrowRight') navigatePreview('next')
    if (e.key === 'Escape') setSelectedGeneration(null)
  }

  // Add keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown as any)
    return () => window.removeEventListener('keydown', handleKeyDown as any)
  }, [selectedGeneration])

  // Rotate loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 2000) // Change message every 2 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      {/* Empty State */}
      {generations.length === 0 ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Your First Image</h2>
            <p className="text-gray-500 text-sm">Enter a prompt below to generate SharePoint images</p>
          </div>
        </div>
      ) : (
        <>
          {/* Grid - Masonry style */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {generations.map((generation) => (
              <div
                key={generation.id}
                className="relative group cursor-pointer break-inside-avoid animate-fade-in"
                draggable={generation.status === 'completed'}
                onDragStart={(e) => generation.status === 'completed' && handleDragStart(e, generation.image_url)}
                onDragEnd={handleDragEnd}
              >
            {/* Loading State */}
            {generation.status === 'generating' && (
              <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingMessageIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-gray-500 font-medium"
                    >
                      {LOADING_MESSAGES[loadingMessageIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Failed State */}
            {generation.status === 'failed' && (
              <div className="aspect-video bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center">
                <p className="text-sm text-red-600">Generation failed</p>
              </div>
            )}

            {/* Completed Image */}
            {generation.status === 'completed' && (
              <>
                <img
                  src={generation.image_url}
                  alt={generation.prompt}
                  className="w-full object-cover rounded-2xl hover:shadow-xl transition-shadow"
                  onClick={() => setSelectedGeneration(generation)}
                />

                {/* Hover Actions - Bottom overlay */}
                <div className="
                  absolute bottom-0 left-0 right-0
                  bg-gradient-to-t from-black/80 via-black/50 to-transparent
                  rounded-b-2xl
                  opacity-0 group-hover:opacity-100
                  pointer-events-none group-hover:pointer-events-auto
                  transition-opacity duration-200
                  p-3
                "
                onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-start gap-2">
                    <button
                      onClick={() => {
                        addImageReference({
                          id: crypto.randomUUID(),
                          url: generation.image_url
                        })
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors text-white text-xs font-medium"
                      title="Use as reference"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Vary</span>
                    </button>
                    <button
                      onClick={() => handleCopyToClipboard(generation.image_url)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors text-white text-xs font-medium"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>

                    <div className="flex-1"></div>

                    <button
                      onClick={() => handleDownload(
                        generation.image_url,
                        `sharepoint-${generation.generation_type}-${Date.now()}.png`
                      )}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors text-white text-xs font-medium"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => deleteGeneration(generation.id)}
                      className="p-1.5 bg-white/10 hover:bg-red-500/80 backdrop-blur-sm rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </>
            )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Full-Screen Preview Modal */}
      <AnimatePresence>
        {selectedGeneration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            {/* Close Button - Top Right */}
            <button
              onClick={() => setSelectedGeneration(null)}
              className="absolute top-6 right-6 z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Image - Centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={selectedGeneration.image_url}
                alt={selectedGeneration.prompt}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Navigation Arrows */}
            {generations.length > 1 && (
              <>
                <button
                  onClick={() => navigatePreview('prev')}
                  className="
                    absolute left-6 top-1/2 -translate-y-1/2
                    p-3 hover:bg-white/10
                    rounded-full transition-colors
                  "
                >
                  <ChevronLeft className="w-7 h-7 text-white" />
                </button>
                <button
                  onClick={() => navigatePreview('next')}
                  className="
                    absolute right-6 top-1/2 -translate-y-1/2
                    p-3 hover:bg-white/10
                    rounded-full transition-colors
                  "
                >
                  <ChevronRight className="w-7 h-7 text-white" />
                </button>
              </>
            )}

            {/* Bottom Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="max-w-7xl mx-auto">
                {/* Image Info */}
                <div className="mb-4 text-white">
                  <p className="text-sm text-white/70 mb-1">
                    {selectedGeneration.generation_type} • {selectedGeneration.dimensions}
                  </p>
                  <p className="text-sm text-white/90">
                    {selectedGeneration.prompt}
                  </p>
                </div>

                {/* Action Icons */}
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleCopyToClipboard(selectedGeneration.image_url)}
                    className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                    <span className="text-sm">Copy</span>
                  </button>

                  <button
                    onClick={() => {
                      addImageReference({
                        id: crypto.randomUUID(),
                        url: selectedGeneration.image_url
                      })
                    }}
                    className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span className="text-sm">Use as Reference</span>
                  </button>

                  <button
                    onClick={() => {
                      setPrompt(selectedGeneration.prompt)
                      setSelectedGeneration(null)
                    }}
                    className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm">Regenerate</span>
                  </button>

                  <div className="flex-1"></div>

                  <button
                    onClick={() => handleDownload(
                      selectedGeneration.image_url,
                      `sharepoint-${selectedGeneration.generation_type}-${Date.now()}.png`
                    )}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-white/90 text-black rounded-lg font-medium text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
