import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { refreshSubscription } from '@/lib/billing'
import { stripe } from '@/lib/stripe'

export const runtime = 'nodejs'

// Stripe calls this after payments and subscription changes. THIS, not the redirect back to our site, upgrades the user:
// people can close the tab or fake a redirect, but only Stripe can send a correctly signed event.
export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || !secret) return NextResponse.json({ error: 'Missing signature.' }, { status: 400 })

  const raw = await req.text() // the signature is computed over the exact raw body, so do not parse it first
  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(raw, signature, secret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session
        if (s.mode === 'subscription' && s.subscription) await refreshSubscription(typeof s.subscription === 'string' ? s.subscription : s.subscription.id)
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await refreshSubscription((event.data.object as Stripe.Subscription).id)
        break
    }
  } catch (e) {
    console.error('Webhook handling failed:', e)
    return NextResponse.json({ error: 'Handler failed.' }, { status: 500 }) // non-2xx makes Stripe retry later
  }
  return NextResponse.json({ received: true })
}
