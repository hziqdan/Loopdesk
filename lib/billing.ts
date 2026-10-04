import type { Plan, SubStatus } from '@prisma/client'
import type Stripe from 'stripe'
import { db } from './db'
import { stripe } from './stripe'

const mapStatus = (s: string): SubStatus =>
  s === 'trialing' ? 'TRIALING' : s === 'active' ? 'ACTIVE' : s === 'past_due' ? 'PAST_DUE' : 'CANCELED'

// Always read the subscription fresh from Stripe, so the result is right even if events arrive out of order
export async function refreshSubscription(subscriptionId: string) {
  await syncSubscription(await stripe().subscriptions.retrieve(subscriptionId))
}

// Safe to run any number of times with the same data: Stripe retries webhooks
export async function syncSubscription(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  const user = await db.user.findFirst({ where: { OR: [{ id: sub.metadata.userId ?? '' }, { stripeCustomerId: customerId }] } })
  if (!user) return console.error('Stripe subscription has no matching user:', sub.id)

  const plan: Plan = sub.metadata.plan === 'STUDIO' ? 'STUDIO' : 'PRO'
  const status = mapStatus(sub.status)
  const hasAccess = status !== 'CANCELED'

  // An old subscription ending must not wipe out a newer one the user started afterwards
  const existing = await db.subscription.findUnique({ where: { userId: user.id } })
  if (existing && existing.stripeSubId !== sub.id && existing.status !== 'CANCELED' && !hasAccess) return

  const end = (sub as any).current_period_end ?? (sub.items.data[0] as any)?.current_period_end // field moved between Stripe API versions
  const data = { plan, status, currentPeriodEnd: end ? new Date(end * 1000) : null, cancelAtPeriodEnd: sub.cancel_at_period_end }
  await db.$transaction([
    db.subscription.upsert({ where: { userId: user.id }, create: { userId: user.id, stripeSubId: sub.id, ...data }, update: { stripeSubId: sub.id, ...data } }),
    db.user.update({ where: { id: user.id }, data: { plan: hasAccess ? plan : 'FREE' } }),
  ])
}

// Used when someone returns from Stripe Checkout: ask Stripe directly what this user's subscription is.
// It only ever looks at the signed-in user's own Stripe customer, never at anything from the URL.
export async function syncForUser(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } })
  if (!user?.stripeCustomerId) return
  const list = await stripe().subscriptions.list({ customer: user.stripeCustomerId, status: 'all', limit: 10 }) // newest first
  const sub = list.data.find((s) => ['trialing', 'active', 'past_due'].includes(s.status)) ?? list.data[0]
  if (sub) await syncSubscription(sub)
}
