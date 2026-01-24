import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useIsAuthenticated } from '@azure/msal-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Trash2, ChevronLeft, ChevronRight, X, Copy, Image, Settings } from 'lucide-react'
import Header from '../components/Header'
import { useStore } from '../store/useStore'
import { supabase } from '../services/supabase'
import { createCustomerPortalSession } from '../services/stripeService'

interface ImageGeneration {
  id: string
  user_id: string
  prompt: string
  image_url: string
  status: string
  generation_type: string | null
  dimensions: string | null
  created_at: string
}

export default function Profile() {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()
  const { user } = useStore()
  const [generations, setGenerations] = useState<ImageGeneration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<ImageGeneration | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [managingSubscription, setManagingSubscription] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  // Load user's generations from database
  useEffect(() => {
    const loadGenerations = async () => {
      if (!user) return

      setLoading(true)
      const { data, error } = await supabase
        .from('image_generations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading generations:', error)
      } else {
        setGenerations(data || [])
      }
      setLoading(false)
    }

    loadGenerations()
  }, [user])

  // Get usage stats - using accumulation model
  const getUsageStats = () => {
    if (!user) return { balance: 0, monthlyAllocation: 0, bonusImages: 0, totalGenerated: 0 }

    const balance = user.image_balance ?? 0
    const monthlyAllocation = user.monthly_allocation ?? 5
    const bonusImages = user.bonus_images ?? 0
    const totalGenerated = user.images_generated ?? 0

    return { balance, monthlyAllocation, bonusImages, totalGenerated }
  }

  const stats = getUsageStats()

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Get unique generation types for filter
  const generationTypes = ['all', ...new Set(generations.map(g => g.generation_type).filter(Boolean))]

  // Filter generations
  const filteredGenerations = filterType === 'all'
    ? generations
    : generations.filter(g => g.generation_type === filterType)

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    const { error } = await supabase
      .from('image_generations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting generation:', error)
      alert('Failed to delete image')
    } else {
      setGenerations(prev => prev.filter(g => g.id !== id))
      if (selectedImage?.id === id) {
        setSelectedImage(null)
      }
    }
  }

  // Handle download
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

  // Handle copy to clipboard
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

  // Navigate preview
  const navigatePreview = (direction: 'prev' | 'next') => {
    if (!selectedImage) return

    const currentIndex = filteredGenerations.findIndex(g => g.id === selectedImage.id)
    let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0) newIndex = filteredGenerations.length - 1
    if (newIndex >= filteredGenerations.length) newIndex = 0

    setSelectedImage(filteredGenerations[newIndex])
  }

  // Handle manage subscription (opens Stripe Customer Portal)
  const handleManageSubscription = async () => {
    if (!user?.stripe_customer_id) {
      alert('No active subscription found. Please subscribe first.')
      return
    }

    setManagingSubscription(true)
    try {
      const portalUrl = await createCustomerPortalSession({
        customerId: user.stripe_customer_id,
        returnUrl: window.location.href,
      })
      window.location.href = portalUrl
    } catch (error) {
      console.error('Error opening subscription portal:', error)
      alert('Failed to open subscription management. Please try again.')
      setManagingSubscription(false)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return

      if (e.key === 'ArrowLeft') navigatePreview('prev')
      if (e.key === 'ArrowRight') navigatePreview('next')
      if (e.key === 'Escape') setSelectedImage(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage, filteredGenerations])

  if (!user) return null

  // Get tier display info
  const tierInfo = {
    free: { label: 'Free', color: 'bg-gray-100 text-gray-700' },
    basic: { label: 'Basic', color: 'bg-blue-100 text-blue-700' },
    pro: { label: 'Pro', color: 'bg-purple-100 text-purple-700' }
  }

  const currentTier = tierInfo[user.subscription_tier]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* User Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar with gradient */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500" />
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold text-gray-900">{user.name || user.email.split('@')[0]}</span>
                <span className={`px-2.5 py-1 rounded text-xs font-medium ${currentTier.color}`}>
                  {currentTier.label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user.subscription_tier !== 'free' && user.stripe_customer_id && (
                <button
                  onClick={handleManageSubscription}
                  disabled={managingSubscription}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Settings className="w-4 h-4" />
                  {managingSubscription ? 'Loading...' : 'Manage Subscription'}
                </button>
              )}
              <button
                onClick={() => navigate('/pricing')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
              >
                <span className="text-lg">⊕</span> {user.subscription_tier === 'free' ? 'Upgrade Now' : 'Change Plan'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Credits Remaining Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-4">CREDITS REMAINING</p>
            <p className="text-5xl font-bold text-gray-900 mb-4">{stats.balance % 1 === 0 ? stats.balance : stats.balance.toFixed(1)}</p>
            <p className="text-sm text-gray-500">
              {stats.monthlyAllocation > 0 ? (
                <>
                  Your <span className="font-medium text-gray-700">{currentTier.label}</span> plan adds{' '}
                  <span className="font-medium text-gray-700">{stats.monthlyAllocation} credits</span> each month
                </>
              ) : (
                <>
                  <Link to="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">Upgrade</Link> to get monthly credits
                </>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              1K = ½ credit • 2K = 1 credit • 4K = 2 credits
            </p>
          </div>

          {/* Bonus Credit Packs Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">BONUS CREDIT PACKS</p>
            <p className="text-2xl font-semibold text-gray-400 mb-4">Coming Soon</p>
            <p className="text-sm text-gray-500">
              Purchase additional credits as one-time packs
            </p>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-8">
          <p className="text-gray-700">
            {getGreeting()}. You're on the{' '}
            <span className={`px-2 py-0.5 rounded text-sm font-medium ${currentTier.color}`}>
              {currentTier.label}
            </span>{' '}
            plan with{' '}
            <span className="px-2 py-0.5 rounded text-sm font-medium bg-green-100 text-green-700">
              {stats.balance % 1 === 0 ? stats.balance : stats.balance.toFixed(1)} credits
            </span>{' '}
            available. You've generated {stats.totalGenerated} images total.{' '}
            <Link to="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">
              Upgrade now
            </Link>{' '}
            to get more credits each month.
          </p>
        </div>

        {/* Gallery Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Images</h2>

            {/* Filter Dropdown */}
            {generationTypes.length > 2 && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {generationTypes.map(type => (
                  <option key={type} value={type ?? ''}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20 bg-white border border-gray-200 rounded-2xl">
              <div className="w-10 h-10 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredGenerations.length === 0 && (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
              <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
              <p className="text-gray-500 mb-6">Start creating images to build your gallery</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors"
              >
                Create Your First Image
              </button>
            </div>
          )}

          {/* Image Grid */}
          {!loading && filteredGenerations.length > 0 && (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {filteredGenerations.map((generation) => {
                const [width, height] = (generation.dimensions || '1024x1024').split('x').map(Number)
                const aspectRatioStyle = { aspectRatio: `${width}/${height}` }

                return (
                  <div
                    key={generation.id}
                    className="relative group cursor-pointer break-inside-avoid"
                  >
                    <img
                      src={generation.image_url}
                      alt={generation.prompt}
                      className="w-full object-cover rounded-2xl hover:shadow-xl transition-shadow"
                      style={aspectRatioStyle}
                      onClick={() => setSelectedImage(generation)}
                    />

                    {/* Hover Actions */}
                    <div
                      className="
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
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleCopyToClipboard(generation.image_url)}
                          className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4 text-white" />
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(
                              generation.image_url,
                              `sharepoint-${generation.generation_type || 'image'}-${Date.now()}.png`
                            )}
                            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => handleDelete(generation.id)}
                            className="p-2 bg-white/10 hover:bg-red-500/80 backdrop-blur-sm rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.prompt}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Navigation Arrows */}
            {filteredGenerations.length > 1 && (
              <>
                <button
                  onClick={() => navigatePreview('prev')}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3 hover:bg-white/10 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-7 h-7 text-white" />
                </button>
                <button
                  onClick={() => navigatePreview('next')}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 hover:bg-white/10 rounded-full transition-colors"
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
                    {selectedImage.generation_type || 'Image'} {selectedImage.dimensions && `• ${selectedImage.dimensions}`} • {new Date(selectedImage.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-white/90">{selectedImage.prompt}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleCopyToClipboard(selectedImage.image_url)}
                    className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                    <span className="text-sm">Copy</span>
                  </button>

                  <button
                    onClick={() => handleDelete(selectedImage.id)}
                    className="flex items-center gap-2 text-white hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="text-sm">Delete</span>
                  </button>

                  <div className="flex-1" />

                  <button
                    onClick={() => handleDownload(
                      selectedImage.image_url,
                      `sharepoint-${selectedImage.generation_type || 'image'}-${Date.now()}.png`
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
