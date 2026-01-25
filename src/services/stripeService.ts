import { supabase } from './supabase'

interface CreateCheckoutSessionParams {
  priceId: string
  userId: string
  userEmail: string
  tier: 'basic' | 'pro'
}

interface CreatePortalSessionParams {
  customerId: string
  returnUrl?: string
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<string> {
  const { priceId, userId, userEmail, tier } = params

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
    throw new Error(`Failed to create checkout session: ${error.message}`)
  }

  if (data?.error) {
    throw new Error(`Stripe error: ${data.error}`)
  }

  if (!data?.url) {
    throw new Error('No checkout URL returned')
  }

  return data.url
}

export async function createCustomerPortalSession(params: CreatePortalSessionParams): Promise<string> {
  const { customerId, returnUrl } = params

  const { data, error } = await supabase.functions.invoke('create-portal-session', {
    body: {
      customerId,
      returnUrl: returnUrl || `${window.location.origin}/profile`,
    },
  })

  if (error) {
    throw new Error(`Failed to create portal session: ${error.message}`)
  }

  if (data?.error) {
    throw new Error(`Stripe error: ${data.error}`)
  }

  if (!data?.url) {
    throw new Error('No portal URL returned')
  }

  return data.url
}
