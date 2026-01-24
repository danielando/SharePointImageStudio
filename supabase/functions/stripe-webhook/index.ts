// Stripe Webhook Handler - Using Stripe SDK for signature verification
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'stripe-signature, content-type',
}

serve(async (req) => {
  console.log('=== STRIPE WEBHOOK RECEIVED ===')
  console.log('Method:', req.method)
  console.log('Time:', new Date().toISOString())

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Get environment variables
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  console.log('Webhook secret configured:', webhookSecret ? `Yes (${webhookSecret.substring(0, 10)}...)` : 'No')

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return new Response(
      JSON.stringify({ error: 'Webhook secret not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!stripeSecretKey) {
    console.error('STRIPE_SECRET_KEY not configured')
    return new Response(
      JSON.stringify({ error: 'Stripe secret key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get signature header
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    console.error('No stripe-signature header')
    return new Response(
      JSON.stringify({ error: 'No signature header' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get request body as text (required for signature verification)
  const payload = await req.text()
  console.log('Payload length:', payload.length)

  // Initialize Stripe
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  })

  // Verify signature and construct event using Stripe SDK
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret
    )
    console.log('Signature verified successfully!')
  } catch (err) {
    console.error('Signature verification failed:', err.message)
    return new Response(
      JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log('Event type:', event.type)
  console.log('Event ID:', event.id)

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

  // Check idempotency - skip if already processed
  console.log('Checking if event was already processed...')
  const { data: isNewEvent, error: idempotencyError } = await supabase.rpc('check_and_record_stripe_event', {
    p_event_id: event.id,
    p_event_type: event.type,
    p_payload: event.data.object,
  })

  if (idempotencyError) {
    console.error('Idempotency check error:', idempotencyError)
    // Continue processing even if idempotency check fails - better to risk duplicate than miss
  } else if (isNewEvent === false) {
    console.log('Event already processed, skipping')
    return new Response(
      JSON.stringify({ received: true, skipped: true, reason: 'already_processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log('Processing new event...')

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const tier = session.metadata?.tier
    const customerId = session.customer as string

    console.log('Checkout completed:')
    console.log('  - User ID:', userId)
    console.log('  - Tier:', tier)
    console.log('  - Customer ID:', customerId)

    if (!userId || !tier) {
      console.error('Missing metadata (userId or tier)')
      return new Response(
        JSON.stringify({ error: 'Missing metadata' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update user subscription in database
    console.log('Calling update_user_subscription RPC...')
    const { data, error } = await supabase.rpc('update_user_subscription', {
      p_user_id: userId,
      p_tier: tier,
      p_stripe_customer_id: customerId,
    })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: `Database error: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Subscription updated successfully:', data)
  }

  // Handle subscription cancellation (when subscription period ends after cancel)
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    console.log('Subscription deleted:')
    console.log('  - Customer ID:', customerId)

    // Find user by Stripe customer ID and downgrade to free
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)

    if (findError) {
      console.error('Error finding user:', findError)
    } else if (users && users.length > 0) {
      const userId = users[0].id
      console.log('Downgrading user to free tier:', userId)

      // Downgrade to free tier (keeps existing balance, but stops monthly allocation)
      const { error: updateError } = await supabase
        .from('users')
        .update({
          subscription_tier: 'free',
          monthly_allocation: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error downgrading user:', updateError)
      } else {
        console.log('User downgraded to free tier successfully')
      }
    } else {
      console.log('No user found with customer ID:', customerId)
    }
  }

  // Handle subscription update (plan change, renewal, etc.)
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const status = subscription.status

    console.log('Subscription updated:')
    console.log('  - Customer ID:', customerId)
    console.log('  - Status:', status)
    console.log('  - Cancel at period end:', subscription.cancel_at_period_end)

    // If subscription is set to cancel at period end, we can optionally notify the user
    // but we don't downgrade until it actually ends (handled by customer.subscription.deleted)
    if (subscription.cancel_at_period_end) {
      console.log('Subscription will cancel at:', new Date(subscription.current_period_end * 1000).toISOString())
    }
  }

  // Return success
  return new Response(
    JSON.stringify({ received: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
