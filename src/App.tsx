import { useEffect } from 'react'
import { useStore } from './store/useStore'
import { supabase } from './lib/supabase'
import { generateImage, uploadImageReference } from './services/nanoBanana'
import GenerationInterface from './components/GenerationInterface'
import ElementsModal from './components/ElementsModal'
import ImageCanvas from './components/ImageCanvas'
import { Generation } from './types'

export default function App() {
  const {
    userId,
    setUserId,
    selectedType,
    prompt,
    variationsCount,
    imageReferences,
    setElements,
    setGenerations,
    addGeneration,
    updateGeneration,
  } = useStore()

  // Skip auth for now - set a temporary user ID
  useEffect(() => {
    // Set a mock user ID for testing without auth
    setUserId('dev-user-123')
  }, [])

  const loadUserData = async (uid: string) => {
    try {
      // Load elements
      const { data: elementsData, error: elementsError } = await supabase
        .from('elements')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })

      if (elementsError) throw elementsError
      if (elementsData) setElements(elementsData)

      // Load generations
      const { data: generationsData, error: generationsError } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(50)

      if (generationsError) throw generationsError
      if (generationsData) {
        setGenerations(generationsData.map(g => ({ ...g, status: 'completed' as const })))
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUserId(null)
    setElements([])
    setGenerations([])
  }

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

      // Add to UI immediately with generating status
      addGeneration(newGeneration)

      // Generate each image independently (don't await - let them run in parallel)
      ;(async () => {
        try {
          const imageUrl = await generateImage({
            prompt,
            width: selectedType.dimensions.width,
            height: selectedType.dimensions.height,
            imageReferences: imageRefs.length > 0 ? imageRefs : undefined,
          })

          // Update in store with completed status
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

  // Skip auth UI for now

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo/Icon - Left */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">SharePoint Studio</span>
          </div>

          {/* Navigation - Right */}
          <div className="flex items-center gap-6">
            <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Login
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Images at top */}
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <ImageCanvas />
        </div>
      </main>

      {/* Generation Interface - Fixed at bottom */}
      <GenerationInterface onGenerate={handleGenerate} />

      {/* Modals */}
      <ElementsModal />
    </div>
  )
}
