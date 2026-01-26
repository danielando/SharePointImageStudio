import { useEffect, useState } from 'react'
import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { useStore, RESOLUTION_OPTIONS } from '../store/useStore'
import { generateImage, uploadImageReference } from '../services/nanoBanana'
import { supabase } from '../services/supabase'
import GenerationInterface from '../components/GenerationInterface'
import ElementsModal from '../components/ElementsModal'
import ImageCanvas from '../components/ImageCanvas'
import Header from '../components/Header'
import SignInModal from '../components/SignInModal'
import UpgradeModal from '../components/UpgradeModal'
import { Generation } from '../types'
import { IMAGE_STYLES } from '../constants/imageStyles'
import { trackGenerateImage, trackCreditsDepleted } from '../services/analytics'

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
    selectedResolution,
    imageReferences,
    addGeneration,
    updateGeneration,
    generations,
  } = useStore()

  // Calculate credit cost based on resolution and variations
  const resolutionOption = RESOLUTION_OPTIONS.find(r => r.id === selectedResolution) || RESOLUTION_OPTIONS[1]
  const creditCostPerImage = resolutionOption.creditCost
  const totalCreditCost = creditCostPerImage * variationsCount

  const hasGenerations = generations.length > 0
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Load user data when authenticated
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated && accounts.length > 0) {
        const account = accounts[0]

        // Load user from Supabase (id = Azure AD homeAccountId)
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', account.homeAccountId)
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
      setShowSignInModal(true)
      return
    }

    // Check credit balance
    const currentBalance = user.image_balance ?? 0

    // Check if user has enough credits for the total cost
    if (currentBalance < totalCreditCost) {
      trackCreditsDepleted(user.subscription_tier)
      setShowUpgradeModal(true)
      return
    }

    // Track image generation event
    trackGenerateImage({
      generationType: selectedType.name,
      resolution: selectedResolution,
      style: selectedStyle,
      hasReferences: imageReferences.length > 0,
      variationsCount,
    })

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
          // CRITICAL: Deduct credits BEFORE calling the API to prevent race conditions
          const { data: decrementSuccess, error: decrementError } = await supabase
            .rpc('decrement_image_balance', {
              p_user_id: user.id,
              p_count: creditCostPerImage
            })

          if (decrementError || decrementSuccess === false) {
            updateGeneration(generationId, { status: 'failed' })
            return
          }

          // Update local user state optimistically
          setUser({
            ...user,
            image_balance: Math.max(0, (user.image_balance ?? 0) - creditCostPerImage),
            images_generated: (user.images_generated ?? 0) + 1
          })

          // Apply style to prompt
          const styleConfig = IMAGE_STYLES.find(s => s.id === selectedStyle)
          const styledPrompt = styleConfig && styleConfig.prompt
            ? `${prompt}. ${styleConfig.prompt}`
            : prompt

          // Use user-selected resolution
          const imageUrl = await generateImage({
            prompt: styledPrompt,
            width: selectedType.dimensions.width,
            height: selectedType.dimensions.height,
            imageReferences: imageRefs.length > 0 ? imageRefs : undefined,
            imageSize: selectedResolution,
          })

          // Refresh user data to get accurate balance
          const { data: updatedUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          if (updatedUser) {
            setUser(updatedUser)
          }

          // Save to database for profile gallery
          await supabase
            .from('image_generations')
            .insert({
              user_id: user.id,
              prompt: styledPrompt,
              image_url: imageUrl,
              status: 'completed',
              generation_type: selectedType.name,
              dimensions: `${selectedType.dimensions.width}x${selectedType.dimensions.height}`,
            })


          updateGeneration(generationId, {
            image_url: imageUrl,
            status: 'completed',
          })
        } catch {
          updateGeneration(generationId, { status: 'failed' })
          // Note: Credits are NOT refunded on failure - this prevents abuse
          // Users can contact support for legitimate failures
        }
      })()
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Centered Layout - No generations yet */}
      {!hasGenerations && (
        <>
          <main className="flex-1 overflow-y-auto px-6 py-8">
            <div className="w-full max-w-4xl mx-auto">
              {/* Hero Section - Different content for authenticated vs non-authenticated users */}
              {isAuthenticated ? (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
                    What would you like to create?
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500 text-center mb-6">
                    Start with a SharePoint-ready prompt or choose a common page type below.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
                    Create SharePoint-ready images in seconds
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 text-center mb-6 max-w-2xl mx-auto">
                    Built for Microsoft 365 teams who need clean, consistent visuals for intranet pages, news posts, and team sites — without designers or stock photos.
                  </p>

                  {/* Primary CTA */}
                  <div className="text-center mb-8">
                    <button
                      onClick={() => setShowSignInModal(true)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors text-base"
                    >
                      Generate your first SharePoint image
                    </button>
                    <p className="text-sm text-gray-500 mt-3">
                      Free to try · 2 free images · No credit card required
                    </p>
                  </div>
                </>
              )}

              {/* Generation Interface */}
              <GenerationInterface onGenerate={handleGenerate} centered />
            </div>
          </main>
        </>
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
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        prompt={prompt}
      />
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  )
}
