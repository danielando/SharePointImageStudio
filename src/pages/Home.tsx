import { useEffect } from 'react'
import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { useStore } from '../store/useStore'
import { generateImage, uploadImageReference } from '../services/nanoBanana'
import { signIn } from '../services/authService'
import { supabase } from '../services/supabase'
import GenerationInterface from '../components/GenerationInterface'
import ElementsModal from '../components/ElementsModal'
import ImageCanvas from '../components/ImageCanvas'
import Header from '../components/Header'
import { Generation } from '../types'
import { IMAGE_STYLES } from '../constants/imageStyles'

export default function Home() {
  const isAuthenticated = useIsAuthenticated()
  const { accounts } = useMsal()
  const {
    user,
    setUser,
    setAuthenticated,
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

  // Load user data when authenticated
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated && accounts.length > 0) {
        const account = accounts[0]

        // Load user from Supabase
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('azure_ad_id', account.homeAccountId)
          .single()

        if (existingUser) {
          setUser(existingUser)
          setAuthenticated(true)
        }
      }
    }

    loadUser()
  }, [isAuthenticated, accounts])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      alert('Please sign in to generate images')
      await signIn()
      return
    }

    // Check usage limits
    const { data: usageCheck } = await supabase
      .rpc('check_and_reset_monthly_usage', { p_user_id: user.id })
      .single()

    if (!usageCheck?.can_generate) {
      alert(`You've reached your monthly limit of ${user.monthly_image_limit} images. Please upgrade your plan.`)
      return
    }

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
        user_id: user.id,
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

          // Increment usage counter
          await supabase.rpc('increment_user_usage', {
            p_user_id: user.id,
            p_credits_used: 1,
          })

          // Refresh user data
          const { data: updatedUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          if (updatedUser) {
            setUser(updatedUser)
          }

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
      <Header />

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
