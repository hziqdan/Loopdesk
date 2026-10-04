import Stripe from 'stripe'

export const stripe = () => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key)
}

// Prices in US cents. They match the pricing page: yearly is billed as 12 x the discounted monthly price.
export const PRICES = {
  PRO: { month: 1200, year: 12000 },
  STUDIO: { month: 2900, year: 27600 },
} as const
export const PLAN_NAME = { PRO: 'Pro', STUDIO: 'Studio' } as const
export const appUrl = () => process.env.APP_URL ?? 'http://localhost:3000'
