// Stripe Configuration - Uses environment variables
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
}

// Stripe Price IDs for subscription tiers
export const STRIPE_PRICE_IDS = {
  basic: import.meta.env.VITE_STRIPE_PRICE_ID_BASIC,
  pro: import.meta.env.VITE_STRIPE_PRICE_ID_PRO,
}
