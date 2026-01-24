import { supabase } from './supabase'

interface CreateCheckoutSessionParams {
  priceId: string
  userId: string
  userEmail: string
  tier: 'basic' | 'pro'
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<string> {
  const { priceId, userId, userEmail, tier } = params

  console.log('Creating checkout session:', { priceId, userId, userEmail, tier })

  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: {
      priceId,
      userId,
      userEmail,
      tier,
      successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/pricing`,
    },
  })

  if (error) {
    console.error('Error creating checkout session:', error)
    throw new Error(`Failed to create checkout session: ${error.message}`)
  }

  if (data?.error) {
    console.error('Stripe error:', data.error)
    throw new Error(`Stripe error: ${data.error}`)
  }

  if (!data?.url) {
    console.error('No URL in response:', data)
    throw new Error('No checkout URL returned')
  }

  console.log('Checkout URL received:', data.url)
  return data.url
}
