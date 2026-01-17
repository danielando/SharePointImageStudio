import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { generateImage, uploadImageReference } from '../services/nanoBanana'
import GenerationInterface from '../components/GenerationInterface'
import ElementsModal from '../components/ElementsModal'
import ImageCanvas from '../components/ImageCanvas'
import { Generation } from '../types'
import { IMAGE_STYLES } from '../constants/imageStyles'

export default function Home() {
  const {
    userId,
    setUserId,
    selectedType,
    prompt,
    variationsCount,
    selectedStyle,
    imageReferences,
    addGeneration,
    updateGeneration,
    generations,
  } = useStore()

  const hasGenerations = generations.length > 0

  // Skip auth for now - set a temporary user ID
  useEffect(() => {
    setUserId('dev-user-123')
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    // Upload image references once (shared across all variations)
    const imageRefs = await Promise.all(
      imageReferences.map(async (ref) => {
        if (ref.file) {
          return await uploadImageReference(ref.file)
        }
        return ref.url
      })
    )

    // Create multiple generations based on variationsCount
    for (let i = 0; i < variationsCount; i++) {
      const generationId = crypto.randomUUID()
      const newGeneration: Generation = {
        id: generationId,
        user_id: userId || 'dev-user-123',
        prompt,
        generation_type: selectedType.name,
        dimensions: `${selectedType.dimensions.width}x${selectedType.dimensions.height}`,
        image_url: '',
        element_ids: [],
        created_at: new Date().toISOString(),
        status: 'generating',
      }

      addGeneration(newGeneration)

      ;(async () => {
        try {
          // Apply style to prompt
          const styleConfig = IMAGE_STYLES.find(s => s.id === selectedStyle)
          const styledPrompt = styleConfig && styleConfig.prompt
            ? `${prompt}. ${styleConfig.prompt}`
            : prompt

          const imageUrl = await generateImage({
            prompt: styledPrompt,
            width: selectedType.dimensions.width,
            height: selectedType.dimensions.height,
            imageReferences: imageRefs.length > 0 ? imageRefs : undefined,
          })

          updateGeneration(generationId, {
            image_url: imageUrl,
            status: 'completed',
          })
        } catch (error) {
          console.error('Generation failed:', error)
          updateGeneration(generationId, { status: 'failed' })
        }
      })()
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          {/* Logo/Icon - Left */}
          <div className="flex items-center gap-2">
            <img
              src="/SharePointImageStudioLogo.png"
              alt="SharePoint Image Studio Logo"
              className="w-16 h-16 object-contain"
            />
            <span className="font-semibold text-gray-900">SharePoint Image Studio</span>
          </div>

          {/* Navigation - Right */}
          <div className="flex items-center gap-6">
            <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Login
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Centered Layout - No generations yet */}
      {!hasGenerations && (
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-4xl">
            <h1 className="text-5xl font-bold text-gray-900 text-center mb-8">
              SharePoint Image Studio
            </h1>
            <GenerationInterface onGenerate={handleGenerate} centered />
          </div>
        </main>
      )}

      {/* Bottom Layout - Has generations */}
      {hasGenerations && (
        <>
          <main className="flex-1 overflow-y-auto pb-32">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <ImageCanvas />
            </div>
          </main>
          <GenerationInterface onGenerate={handleGenerate} />
        </>
      )}

      {/* Modals */}
      <ElementsModal />
    </div>
  )
}
