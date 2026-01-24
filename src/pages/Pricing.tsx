import { useState } from 'react'
import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useIsAuthenticated } from '@azure/msal-react'
import Header from '../components/Header'
import { useStore } from '../store/useStore'
import { signIn } from '../services/authService'
import { createCheckoutSession } from '../services/stripeService'
import { STRIPE_PRICE_IDS } from '../config/stripeConfig'

export default function Pricing() {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()
  const { user } = useStore()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePlanSelection = async (planName: string) => {
    try {
      setLoading(planName)

      // Free tier - just sign in and go to homepage
      if (planName === 'Free') {
        if (!isAuthenticated) {
          await signIn()
        } else {
          navigate('/')
        }
        return
      }

      // Paid tiers - require authentication first
      if (!isAuthenticated || !user) {
        // Store the intended plan for after login
        sessionStorage.setItem('pendingPlan', planName)
        await signIn()
        return
      }

      // Create Stripe checkout session
      const priceId = planName === 'Basic' ? STRIPE_PRICE_IDS.basic : STRIPE_PRICE_IDS.pro
      const tier = planName.toLowerCase() as 'basic' | 'pro'

      const checkoutUrl = await createCheckoutSession({
        priceId,
        userId: user.id,
        userEmail: user.email,
        tier,
      })

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error selecting plan:', error)
      alert(`Failed to select plan: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  // Helper function to determine button text and style based on user's current tier
  const getButtonConfig = (planName: string) => {
    // If user is not authenticated, show default call-to-action text
    if (!isAuthenticated || !user) {
      return {
        text: planName === 'Free' ? 'Get Started Free' : `Get ${planName}`,
        style: planName === 'Free' ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' : 'bg-black hover:bg-gray-800 text-white',
        disabled: false,
        showBadge: false
      }
    }

    const currentTier = user.subscription_tier
    const planTier = planName.toLowerCase()

    const tierRank = { free: 0, basic: 1, pro: 2 }
    const currentRank = tierRank[currentTier]
    const planRank = tierRank[planTier]

    // Current plan
    if (currentRank === planRank) {
      return {
        text: 'Current Plan',
        style: 'bg-gray-100 text-gray-600 cursor-default',
        disabled: true,
        showBadge: true
      }
    }

    // Higher tier (upgrade)
    if (planRank > currentRank) {
      return {
        text: 'Upgrade',
        style: 'bg-black hover:bg-gray-800 text-white',
        disabled: false,
        showBadge: false
      }
    }

    // Lower tier (downgrade)
    return {
      text: 'Downgrade',
      style: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      disabled: false,
      showBadge: false
    }
  }

  const plans = [
    {
      name: 'Free',
      tier: 'free',
      description: 'Try it out',
      price: 0,
      period: '/mo',
      billingNote: '',
      limit: '2 credits to try',
      limitNote: '2 images at 2K or 4 at 1K',
      features: [
        'All SharePoint image types',
        'AI-powered image generation',
        'Choose your resolution (1K, 2K, 4K)',
      ]
    },
    {
      name: 'Basic',
      tier: 'basic',
      description: 'Consistent image creation for individuals',
      price: 15,
      period: '/mo',
      billingNote: 'billed monthly',
      limit: '50 credits / month',
      limitNote: '50 images at 2K, 100 at 1K, or 25 at 4K',
      heading: 'Everything in Free plus:',
      features: [
        'Advanced style options',
        'Image reference uploads',
        'Up to 3 variations per generation',
        'Credits roll over while subscribed',
      ]
    },
    {
      name: 'Pro',
      tier: 'pro',
      description: 'Higher resolution, more output, priority generation',
      price: 49,
      period: '/mo',
      billingNote: 'billed monthly',
      limit: '100 credits / month',
      limitNote: '100 images at 2K, 200 at 1K, or 50 at 4K',
      heading: 'Everything in Basic plus:',
      features: [
        'Up to 5 variations per generation',
        'Priority generation queue',
        'Custom brand elements',
        'SharePoint site integration (coming soon)',
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Pricing Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Pricing</h1>
          <p className="text-gray-600 text-lg">See our plans for individuals, businesses, and enterprises.</p>
        </div>


        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ gridAutoRows: '1fr' }}>
          {plans.map((plan, index) => {
            const buttonConfig = getButtonConfig(plan.name)
            const isCurrentPlan = buttonConfig.showBadge

            return (
              <div
                key={index}
                className={`border rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow flex flex-col h-full relative ${
                  isCurrentPlan ? 'border-blue-500 border-2' : 'border-gray-200'
                }`}
              >
                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                      Your Current Plan
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 min-h-[40px]">{plan.description}</p>

                  <div className="flex items-baseline mb-1">
                    <span className="text-4xl font-bold text-gray-900">USD {plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                  <div className="h-4">
                    {plan.billingNote && (
                      <p className="text-xs text-gray-500">{plan.billingNote}</p>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanSelection(plan.name)}
                  disabled={loading === plan.name || buttonConfig.disabled}
                  className={`w-full py-3 rounded-full font-medium text-sm transition-colors mb-6 ${buttonConfig.style} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.name ? 'Loading...' : `${buttonConfig.text} →`}
                </button>

                {/* Credits */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-900 mb-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-medium">{plan.limit}</span>
                  </div>
                  {plan.limitNote && (
                    <p className="text-xs text-gray-500 ml-6">{plan.limitNote}</p>
                  )}
                </div>

                {/* Features - Grow to fill space */}
                <div className="flex-1">
                  {plan.heading && (
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                      </svg>
                      <span>{plan.heading}</span>
                    </div>
                  )}
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-gray-900 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
