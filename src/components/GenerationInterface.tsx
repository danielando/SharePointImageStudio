import { useState, useRef } from 'react'
import { Sparkles, Upload, X, Maximize2, Palette, Image as ImageIcon, Wand2, Shuffle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { GENERATION_TYPES } from '../types'
import { ImageReference } from '../types'
import { IMAGE_STYLES } from '../constants/imageStyles'
import { getRandomPrompt } from '../constants/randomPrompts'

interface GenerationInterfaceProps {
  onGenerate: () => void
}

export default function GenerationInterface({ onGenerate }: GenerationInterfaceProps) {
  const {
    prompt,
    setPrompt,
    selectedType,
    setSelectedType,
    variationsCount,
    setVariationsCount,
    selectedStyle,
    setSelectedStyle,
    imageReferences,
    addImageReference,
    removeImageReference,
    generations,
  } = useStore()

  const [isDragging, setIsDragging] = useState(false)
  const [showDimensionPicker, setShowDimensionPicker] = useState(false)
  const [showVariationsPicker, setShowVariationsPicker] = useState(false)
  const [showStylePicker, setShowStylePicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onGenerate()
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Image Reference Thumbnails */}
        {imageReferences.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {imageReferences.map(ref => (
              <div key={ref.id} className="relative group">
                <img
                  src={ref.url}
                  alt="Reference"
                  className="w-14 h-14 object-cover rounded-xl border border-gray-200"
                />
                <button
                  onClick={() => removeImageReference(ref.id)}
                  className="
                    absolute -top-2 -right-2 w-6 h-6
                    bg-black rounded-full
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    transition-opacity shadow-lg
                  "
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Aspect Ratio Picker Panel */}
        {showDimensionPicker && (
          <div className="mb-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Select Dimensions</h3>
              <button
                onClick={() => setShowDimensionPicker(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex items-center justify-start gap-3 flex-wrap">
              {GENERATION_TYPES.map(type => {
                const ratio = type.dimensions.width / type.dimensions.height
                const isSelected = selectedType.id === type.id

                // Calculate visual size based on ratio
                let width, height
                if (ratio >= 3) { // Ultra-wide (16:3.2)
                  width = 56; height = 32
                } else if (ratio >= 2.5) { // Wide (2.85:1)
                  width = 52; height = 32
                } else if (ratio >= 1.5) { // Standard wide (16:9)
                  width = 48; height = 32
                } else if (ratio >= 1.2) { // Slightly wide (1.78:1)
                  width = 42; height = 32
                } else { // Square (1:1)
                  width = 32; height = 32
                }

                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type)
                      setShowDimensionPicker(false)
                    }}
                    className={`
                      flex flex-col items-center gap-1.5 p-3 rounded-xl
                      transition-all
                      ${isSelected
                        ? 'bg-gray-100'
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <div
                      className={`
                        border-2 rounded-md transition-all
                        ${isSelected
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-300 bg-white'
                        }
                      `}
                      style={{ width: `${width}px`, height: `${height}px` }}
                    />
                    <span className={`
                      text-xs font-medium
                      ${isSelected ? 'text-gray-900' : 'text-gray-500'}
                    `}>
                      {type.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {type.dimensions.width}×{type.dimensions.height}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Variations Picker Panel */}
        {showVariationsPicker && (
          <div className="mb-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Number of Variations</h3>
              <button
                onClick={() => setShowVariationsPicker(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    setVariationsCount(count)
                    setShowVariationsPicker(false)
                  }}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${variationsCount === count
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Style Picker Panel */}
        {showStylePicker && (
          <div className="mb-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Select Style</h3>
              <button
                onClick={() => setShowStylePicker(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {IMAGE_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setSelectedStyle(style.id)
                    setShowStylePicker(false)
                  }}
                  className={`
                    flex flex-col items-start p-3 rounded-xl
                    transition-all text-left
                    ${selectedStyle === style.id
                      ? 'bg-gray-100 border-2 border-gray-900'
                      : 'border-2 border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <span className={`
                    text-sm font-medium mb-1
                    ${selectedStyle === style.id ? 'text-gray-900' : 'text-gray-700'}
                  `}>
                    {style.name}
                  </span>
                  <span className="text-xs text-gray-500">{style.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Prompt Box */}
        <div className="bg-gray-50 rounded-3xl border border-gray-200 p-4">
          {/* Top Row - Prompt Input */}
          <div className="mb-3">
            <input
              ref={textareaRef as any}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              placeholder="Describe an image and click generate..."
              className={`
                w-full px-1 py-2
                bg-transparent
                border-none
                text-gray-900 placeholder-gray-400
                focus:outline-none
                text-base
                ${isDragging ? 'text-blue-600' : ''}
              `}
            />
          </div>

          {/* Bottom Row - Controls */}
          <div className="flex items-center justify-between">
            {/* Left Side - Option Buttons */}
            <div className="flex items-center gap-2">
              {/* Style Button */}
              <button
                onClick={() => setShowStylePicker(!showStylePicker)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors text-sm text-gray-700"
              >
                <Palette className="w-4 h-4" />
                <span>{IMAGE_STYLES.find(s => s.id === selectedStyle)?.name || 'Style'}</span>
              </button>

              {/* Image Prompt Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors text-sm text-gray-700"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Image prompt</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              {/* Style Transfer Button */}
              <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors text-sm text-gray-700">
                <Wand2 className="w-4 h-4" />
                <span>Style transfer</span>
              </button>

              {/* Random Prompt Button */}
              <button
                onClick={() => setPrompt(getRandomPrompt())}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors text-sm text-gray-700"
                title="Random prompt"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Aspect Ratio */}
              <button
                onClick={() => setShowDimensionPicker(!showDimensionPicker)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors text-sm text-gray-700"
              >
                <Maximize2 className="w-4 h-4" />
                <span>{selectedType.name}</span>
              </button>

              {/* Variations Count */}
              <button
                onClick={() => setShowVariationsPicker(!showVariationsPicker)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors text-sm text-gray-700"
              >
                <span className="font-medium">{variationsCount}x</span>
              </button>
            </div>

            {/* Right Side - Generate Button */}
            <button
              onClick={onGenerate}
              disabled={!prompt.trim()}
              className="
                p-2.5 rounded-full
                bg-black hover:bg-gray-800
                text-white
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all
              "
              title="Generate"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Generation status indicator */}
        {generations.some(g => g.status === 'generating') && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            <span>Generating...</span>
          </div>
        )}
      </div>
    </div>
  )
}
