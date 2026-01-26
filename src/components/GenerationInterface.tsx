import React, { useState, useRef } from 'react'
import { Sparkles, X, Maximize2, Palette, Image as ImageIcon, Shuffle, Monitor } from 'lucide-react'
import { useStore, RESOLUTION_OPTIONS } from '../store/useStore'
import { GENERATION_TYPES } from '../types'
import { ImageReference } from '../types'
import { IMAGE_STYLES } from '../constants/imageStyles'
import { getRandomPrompt } from '../constants/randomPrompts'

// Example images showcasing AI generation capabilities
const PROMPT_CHIPS = [
  {
    label: "Melbourne Weather",
    prompt: "Present a clear, 45 top-down isometric miniature 3D cartoon scene of Melbourne, featuring its most iconic landmarks and architectural elements. Use soft, refined textures with realistic PBR materials and gentle, lifelike lighting and shadows. Integrate the current weather conditions directly into the city environment to create an immersive atmospheric mood. Use a clean, minimalistic composition with a soft, solid-colored background. At the top-center, place the title Melbourne in large bold text, a prominent weather icon beneath it, then the date (small text) and temperature (medium text). All text must be centred with consistent spacing and may subtly overlap the tops of the buildings.",
    image: "/examples/melbourne-weather.jpg"
  },
  {
    label: "Recipe Infographic",
    prompt: "Create a step-by-step recipe infographic for bolognese pasta, top-down view, minimal style on white background, ingredient photos labelled: \"400g spaghetti\", \"500g beef mince\", \"1 onion\", \"2 cloves garlic\", \"400g crushed tomatoes\", \"fresh basil\", dotted node lines showing process steps with icons (boiling pot, mixing, simmering), final plated pasta shot at the bottom.",
    image: "/examples/recipe-infographic.jpg"
  },
  {
    label: "Action Figure",
    prompt: "Generate a highly detailed 1/7 scale action figure of a female anime character with long blue hair and futuristic armor in a realistic style. Place the figure on a computer desk with a transparent circular acrylic base. On the computer screen, show the ZBrush modeling process of the figure. Beside the screen, add a toy packaging box inspired by BANDAI, featuring the original character artwork. Ensure the scene has realistic lighting and textures.",
    image: "/examples/action-figure.jpg"
  },
  {
    label: "SharePoint Bananas",
    prompt: "A beautiful script font that forms the word SharePoint with actual bananas against a black background. The bananas are arranged to spell out the letters, with realistic lighting and shadows.",
    image: "/examples/sharepoint-bananas.jpg"
  }
]

interface GenerationInterfaceProps {
  onGenerate: () => void
  centered?: boolean
  promptInputRef?: React.RefObject<HTMLInputElement | null>
}

export default function GenerationInterface({ onGenerate, centered = false, promptInputRef }: GenerationInterfaceProps) {
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
  const internalInputRef = useRef<HTMLInputElement>(null)

  // Callback ref to sync external ref with internal ref
  const setInputRef = (element: HTMLInputElement | null) => {
    // Set internal ref
    (internalInputRef as React.MutableRefObject<HTMLInputElement | null>).current = element
    // Also set external ref if provided
    if (promptInputRef && 'current' in promptInputRef) {
      (promptInputRef as React.MutableRefObject<HTMLInputElement | null>).current = element
    }
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
              {selectedType.id === 'team-banner' && <span className="text-amber-500"> * Ultra-wide format - abstract patterns and textures work best.</span>}
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
              ref={setInputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              placeholder="Modern abstract hero image for a SharePoint intranet homepage, soft blue tones, minimal, professional"
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

        {/* Example Images - Only show in centered mode, below prompt box */}
        {centered && (
          <div className="mt-6">
            <div className="flex justify-center gap-3 sm:gap-4 overflow-x-auto pb-2 px-2">
              {PROMPT_CHIPS.map(chip => (
                <button
                  key={chip.label}
                  onClick={() => {
                    setPrompt(chip.prompt)
                    internalInputRef.current?.focus()
                  }}
                  className="flex-shrink-0 w-40 sm:w-48 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group bg-gray-100"
                >
                  <div className="relative aspect-square">
                    <img
                      src={chip.image}
                      alt={chip.label}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <p className="text-xs text-gray-600 p-2 bg-white text-center font-medium border-t border-gray-100">
                    {chip.label}
                  </p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              Click an example to use its prompt.
            </p>
          </div>
        )}

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
