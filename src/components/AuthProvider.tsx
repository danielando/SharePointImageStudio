import { useEffect } from 'react'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance, initializeMsal, handleRedirectPromise, attemptSilentSignIn } from '../services/authService'
import { useStore } from '../store/useStore'
import { createCheckoutSession } from '../services/stripeService'
import { STRIPE_PRICE_IDS } from '../config/stripeConfig'

interface AuthProviderProps {
  children: React.ReactNode
}

// Loading screen component for checkout redirect
function CheckoutLoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 text-lg">Setting up your subscription...</p>
      <p className="text-gray-400 text-sm mt-2">Redirecting to payment...</p>
    </div>
  )
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setAuthenticated, isProcessingCheckout, setProcessingCheckout } = useStore()

  // Helper to handle pending plan checkout after login
  const handlePendingPlanCheckout = async (user: any) => {
    const pendingPlan = localStorage.getItem('pendingPlan')

    if (!pendingPlan || pendingPlan === 'Free') {
      localStorage.removeItem('pendingPlan')
      return false
    }

    console.log('📦 Processing pending plan:', pendingPlan)

    // Set loading state BEFORE removing the plan
    setProcessingCheckout(true)
    localStorage.removeItem('pendingPlan')

    try {
      const priceId = pendingPlan === 'Basic' ? STRIPE_PRICE_IDS.basic : STRIPE_PRICE_IDS.pro
      const tier = pendingPlan.toLowerCase() as 'basic' | 'pro'

      const checkoutUrl = await createCheckoutSession({
        priceId,
        userId: user.id,
        userEmail: user.email,
        tier,
      })

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl
      return true
    } catch (error) {
      console.error('Error creating checkout session for pending plan:', error)
      setProcessingCheckout(false)
      // Don't block the user - they can try again from pricing page
      return false
    }
  }

  useEffect(() => {
    const initialize = async () => {
      await initializeMsal()

      // First, handle any redirect from Microsoft login (explicit login flow)
      const redirectResult = await handleRedirectPromise()

      if (redirectResult) {
        console.log('✅ User signed in via redirect')
        setUser(redirectResult.user)
        setAuthenticated(true)

        // Check for pending plan and redirect to checkout if needed
        await handlePendingPlanCheckout(redirectResult.user)
        return
      }

      // If no redirect, attempt silent SSO (seamless sign-in if user is logged into M365)
      const ssoResult = await attemptSilentSignIn()

      if (ssoResult) {
        console.log('✅ User signed in silently via SSO')
        setUser(ssoResult.user)
        setAuthenticated(true)
      } else {
        console.log('ℹ️ No active M365 session - user will need to login')
      }
    }

    initialize()
  }, [setUser, setAuthenticated])

  // Show loading screen while redirecting to Stripe checkout
  if (isProcessingCheckout) {
    return (
      <MsalProvider instance={msalInstance}>
        <CheckoutLoadingScreen />
      </MsalProvider>
    )
  }

  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  )
}
