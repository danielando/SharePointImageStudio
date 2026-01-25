import { useState, useRef } from 'react'
import { Sparkles, X, Maximize2, Palette, Image as ImageIcon, Shuffle, ChevronLeft, ChevronRight, Monitor } from 'lucide-react'
import { useStore, RESOLUTION_OPTIONS } from '../store/useStore'
import { GENERATION_TYPES } from '../types'
import { ImageReference } from '../types'
import { IMAGE_STYLES } from '../constants/imageStyles'
import { getRandomPrompt } from '../constants/randomPrompts'

// Example prompts with thumbnail images (16:9 aspect ratio for wider cards)
const EXAMPLE_PROMPTS = [
  {
    id: '1',
    prompt: 'Modern office building with glass facade at golden hour',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=320&h=180&fit=crop'
  },
  {
    id: '2',
    prompt: 'Team collaboration in a bright meeting room',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=320&h=180&fit=crop'
  },
  {
    id: '3',
    prompt: 'Colorful betta fish swimming in blue water',
    thumbnail: 'https://images.unsplash.com/photo-1520302519878-3935cfe673bb?w=320&h=180&fit=crop'
  },
  {
    id: '4',
    prompt: 'Pink dinosaur toy with knitted sweater',
    thumbnail: 'https://images.unsplash.com/photo-1563170423-4d631ae42e1c?w=320&h=180&fit=crop'
  },
  {
    id: '5',
    prompt: 'Nature landscape with mountains and lake',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=320&h=180&fit=crop'
  },
  {
    id: '6',
    prompt: 'Majestic tree on a hillside with dramatic sky',
    thumbnail: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=320&h=180&fit=crop'
  },
  {
    id: '7',
    prompt: 'Off-road vehicle driving through mud and dirt',
    thumbnail: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=320&h=180&fit=crop'
  },
  {
    id: '8',
    prompt: 'Close-up portrait of a snowy owl',
    thumbnail: 'https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?w=320&h=180&fit=crop'
  },
  {
    id: '9',
    prompt: 'Retro purple sports car in neon lighting',
    thumbnail: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=320&h=180&fit=crop'
  },
  {
    id: '10',
    prompt: 'Eagle with spread wings against sky',
    thumbnail: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=320&h=180&fit=crop'
  },
]

interface GenerationInterfaceProps {
  onGenerate: () => void
  centered?: boolean
}

export default function GenerationInterface({ onGenerate, centered = false }: GenerationInterfaceProps) {
  const {
    user,
    prompt,
    setPrompt,
    selectedType,
    setSelectedType,
    variationsCount,
    setVariationsCount,
    selectedStyle,
    setSelectedStyle,
    selectedResolution,
    setSelectedResolution,
    imageReferences,
    addImageReference,
    removeImageReference,
    generations,
  } = useStore()

  // Tier-based limits
  const maxVariations = user?.subscription_tier === 'pro' ? 5 : user?.subscription_tier === 'basic' ? 3 : 1
  const canUseImageReferences = user?.subscription_tier !== 'free'
  const canUseAdvancedStyles = user?.subscription_tier !== 'free'

  const [isDragging, setIsDragging] = useState(false)
  const [showDimensionPicker, setShowDimensionPicker] = useState(false)
  const [showVariationsPicker, setShowVariationsPicker] = useState(false)
  const [showStylePicker, setShowStylePicker] = useState(false)
  const [showResolutionPicker, setShowResolutionPicker] = useState(false)

  // Get credit cost for current resolution
  const currentResolutionOption = RESOLUTION_OPTIONS.find(r => r.id === selectedResolution) || RESOLUTION_OPTIONS[1]
  const creditCost = currentResolutionOption.creditCost * variationsCount
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const examplesScrollRef = useRef<HTMLDivElement>(null)

  const scrollExamples = (direction: 'left' | 'right') => {
    if (examplesScrollRef.current) {
      const scrollAmount = 220
      examplesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt)
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    if (!canUseImageReferences) {
      alert('Image references are only available for Basic and Pro tiers. Please upgrade to use this feature.')
      return
    }

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
    <div className={centered ? "w-full" : "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200"}>
      <div className={`mx-auto px-4 sm:px-6 ${centered ? 'w-full' : 'max-w-4xl py-4 sm:py-6'}`}>
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
                      {type.aspectRatio}
                      {type.id === 'team-banner' && ' *'}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-[10px] text-gray-400">
              Images generated at closest supported aspect ratio.
              {selectedType.id === 'team-banner' && <span className="text-amber-500"> * Ultra-wide format - results may vary.</span>}
            </p>
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
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  disabled={count > maxVariations}
                  onClick={() => {
                    if (count <= maxVariations) {
                      setVariationsCount(count)
                      setShowVariationsPicker(false)
                    }
                  }}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${count > maxVariations
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                      : variationsCount === count
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                  title={count > maxVariations ? `${count} variations requires ${count === 5 ? 'Pro' : 'Basic'} tier` : ''}
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
              {IMAGE_STYLES.map((style) => {
                const isLocked = !canUseAdvancedStyles && style.id !== 'none'
                return (
                  <button
                    key={style.id}
                    disabled={isLocked}
                    onClick={() => {
                      if (!isLocked) {
                        setSelectedStyle(style.id)
                        setShowStylePicker(false)
                      }
                    }}
                    className={`
                      flex flex-col items-start p-3 rounded-xl
                      transition-all text-left relative
                      ${isLocked
                        ? 'opacity-50 cursor-not-allowed border-2 border-gray-200'
                        : selectedStyle === style.id
                          ? 'bg-gray-100 border-2 border-gray-900'
                          : 'border-2 border-gray-200 hover:border-gray-300'
                      }
                    `}
                    title={isLocked ? 'Advanced styles require Basic or Pro tier' : ''}
                  >
                    <span className={`
                      text-sm font-medium mb-1
                      ${selectedStyle === style.id ? 'text-gray-900' : 'text-gray-700'}
                    `}>
                      {style.name}
                      {isLocked && <span className="ml-1 text-xs">🔒</span>}
                    </span>
                    <span className="text-xs text-gray-500">{style.description}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Resolution Picker Panel */}
        {showResolutionPicker && (
          <div className="mb-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Resolution</h3>
              <button
                onClick={() => setShowResolutionPicker(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-2">
              {RESOLUTION_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSelectedResolution(option.id)
                    setShowResolutionPicker(false)
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all
                    ${selectedResolution === option.id
                      ? 'bg-gray-100 border-2 border-gray-900'
                      : 'border-2 border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <span className={`font-medium ${selectedResolution === option.id ? 'text-gray-900' : 'text-gray-700'}`}>
                    {option.label}
                  </span>
                  <span className={`text-sm ${selectedResolution === option.id ? 'text-gray-700' : 'text-gray-500'}`}>
                    {option.creditCost === 0.5 ? '½' : option.creditCost} credit{option.creditCost !== 1 ? 's' : ''}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Higher resolution = better quality for large displays
            </p>
          </div>
        )}

        {/* Main Prompt Box */}
        <div className="bg-gray-50 rounded-2xl sm:rounded-3xl border border-gray-200 p-3 sm:p-4">
          {/* Top Row - Prompt Input */}
          <div className="mb-2 sm:mb-3">
            <input
              ref={textareaRef as any}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              placeholder="Describe an image..."
              className={`
                w-full px-1
                bg-transparent
                border-none
                text-gray-900 placeholder-gray-400
                focus:outline-none
                ${isDragging ? 'text-blue-600' : ''}
                ${centered ? 'py-3 sm:py-4 text-base sm:text-lg' : 'py-2 text-base'}
              `}
            />
          </div>

          {/* Bottom Row - Controls */}
          <div className="flex items-center justify-between gap-2">
            {/* Left Side - Option Buttons (scrollable on mobile) */}
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0">
              {/* Style Button */}
              <button
                onClick={() => setShowStylePicker(!showStylePicker)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors text-sm text-gray-700 flex-shrink-0"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">{IMAGE_STYLES.find(s => s.id === selectedStyle)?.name || 'Style'}</span>
              </button>

              {/* Reference Image Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors text-sm text-gray-700 flex-shrink-0"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Reference</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              {/* Random Prompt Button */}
              <button
                onClick={() => setPrompt(getRandomPrompt())}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors text-sm text-gray-700 flex-shrink-0"
                title="Random prompt"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Aspect Ratio */}
              <button
                onClick={() => setShowDimensionPicker(!showDimensionPicker)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors text-sm text-gray-700 flex-shrink-0"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="text-xs sm:text-sm">{selectedType.name}</span>
              </button>

              {/* Resolution */}
              <button
                onClick={() => setShowResolutionPicker(!showResolutionPicker)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors text-sm text-gray-700 flex-shrink-0"
              >
                <Monitor className="w-4 h-4" />
                <span className="text-xs sm:text-sm">{selectedResolution}</span>
              </button>

              {/* Variations Count - hide on mobile for free users */}
              {(user?.subscription_tier !== 'free' || !user) && (
                <button
                  onClick={() => setShowVariationsPicker(!showVariationsPicker)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors text-sm text-gray-700 flex-shrink-0"
                >
                  <span className="font-medium text-xs sm:text-sm">{variationsCount}x</span>
                </button>
              )}
            </div>

            {/* Right Side - Generate Button with credit cost */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {user && (
                <span className="text-xs text-gray-500 hidden sm:inline">
                  {creditCost === 0.5 ? '½' : creditCost} cr
                </span>
              )}
              <button
                onClick={onGenerate}
                disabled={!prompt.trim()}
                className="
                  p-2 sm:p-2.5 rounded-full
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
        </div>

        {/* Generation status indicator */}
        {generations.some(g => g.status === 'generating') && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            <span>Generating...</span>
          </div>
        )}
      </div>

      {/* Example Prompts Carousel - Only show when centered (no generations yet) */}
      {centered && (
        <div className="fixed bottom-0 left-0 right-0 pb-3 sm:pb-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 px-4 sm:px-6">Get inspired for your next SharePoint page</p>
          <div className="relative">
            {/* Scroll Left Button - Hidden on mobile */}
            <button
              onClick={() => scrollExamples('left')}
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            {/* Scrollable Container - Full width edge to edge */}
            <div
              ref={examplesScrollRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide px-4 sm:pl-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {EXAMPLE_PROMPTS.map((example, index) => (
                <button
                  key={example.id}
                  onClick={() => handleExampleClick(example.prompt)}
                  className="flex-shrink-0 group relative rounded-xl sm:rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    width: 'clamp(140px, 30vw, 180px)',
                    height: 'clamp(80px, 17vw, 100px)',
                    marginRight: index === EXAMPLE_PROMPTS.length - 1 ? '16px' : '0'
                  }}
                >
                  <img
                    src={example.thumbnail}
                    alt={example.prompt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to a gradient if image fails to load
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  />
                  {/* Hover overlay with prompt text - always visible on mobile tap */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity flex items-end p-2 sm:p-3">
                    <p className="text-white text-[10px] sm:text-xs line-clamp-2 sm:line-clamp-3">{example.prompt}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Scroll Right Button - Hidden on mobile */}
            <button
              onClick={() => scrollExamples('right')}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
