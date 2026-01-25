// Google Analytics 4 Event Tracking
// Documentation: https://developers.google.com/analytics/devguides/collection/ga4/events

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

// Helper to safely call gtag
function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

// ============================================================================
// CONVERSION EVENTS
// ============================================================================

/**
 * Track when a user signs up (creates an account)
 */
export function trackSignUp(method: string = 'azure_ad') {
  trackEvent('sign_up', {
    method,
  })
}

/**
 * Track when a user starts the checkout process
 */
export function trackBeginCheckout(tier: 'basic' | 'pro', value: number) {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value,
    items: [{
      item_name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
      item_category: 'subscription',
      price: value,
    }],
  })
}

/**
 * Track successful purchase/subscription
 */
export function trackPurchase(tier: 'basic' | 'pro', value: number, transactionId?: string) {
  trackEvent('purchase', {
    currency: 'USD',
    value,
    transaction_id: transactionId,
    items: [{
      item_name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
      item_category: 'subscription',
      price: value,
    }],
  })
}

// ============================================================================
// ENGAGEMENT EVENTS
// ============================================================================

/**
 * Track when a user generates an image
 */
export function trackGenerateImage(params: {
  generationType: string
  resolution: '1K' | '2K' | '4K'
  style: string
  hasReferences: boolean
  variationsCount: number
}) {
  trackEvent('generate_image', {
    generation_type: params.generationType,
    resolution: params.resolution,
    style: params.style,
    has_references: params.hasReferences,
    variations_count: params.variationsCount,
  })
}

/**
 * Track when a user downloads an image
 */
export function trackDownloadImage(generationType: string) {
  trackEvent('download_image', {
    generation_type: generationType,
  })
}

/**
 * Track when a user copies an image to clipboard
 */
export function trackCopyImage(generationType: string) {
  trackEvent('copy_image', {
    generation_type: generationType,
  })
}

/**
 * Track when a user submits the contact form
 */
export function trackContactFormSubmit(subject: string) {
  trackEvent('contact_form_submit', {
    subject,
  })
}

// ============================================================================
// USER JOURNEY EVENTS
// ============================================================================

/**
 * Track when a user views the pricing page
 */
export function trackViewPricing() {
  trackEvent('view_pricing', {
    page_location: window.location.href,
  })
}

/**
 * Track when a user runs out of credits
 */
export function trackCreditsDepleted(tier: string) {
  trackEvent('credits_depleted', {
    subscription_tier: tier,
  })
}

/**
 * Track generation type selection
 */
export function trackSelectGenerationType(generationType: string, aspectRatio: string) {
  trackEvent('select_generation_type', {
    generation_type: generationType,
    aspect_ratio: aspectRatio,
  })
}

/**
 * Track style selection
 */
export function trackSelectStyle(style: string) {
  trackEvent('select_style', {
    style,
  })
}

/**
 * Track resolution selection
 */
export function trackSelectResolution(resolution: '1K' | '2K' | '4K') {
  trackEvent('select_resolution', {
    resolution,
  })
}

/**
 * Track when user adds image reference
 */
export function trackAddImageReference() {
  trackEvent('add_image_reference')
}

/**
 * Track profile page view
 */
export function trackViewProfile() {
  trackEvent('view_profile')
}
