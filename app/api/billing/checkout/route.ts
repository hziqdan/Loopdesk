import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { PLAN_NAME, PRICES, appUrl, stripe } from '@/lib/stripe'

const fail = (error: string, code: string, status: number) => NextResponse.json({ error, code }, { status })
const schema = z.object({ plan: z.enum(['PRO', 'STUDIO']), interval: z.enum(['month', 'year']) })

// Creates a Stripe Checkout page for the chosen plan (14-day free trial) and returns its URL
export async function POST(req: Request) {
  const session = await getUser()
  if (!session) return fail('Sign in to start a trial.', 'UNAUTHORIZED', 401)
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail('Invalid plan.', 'VALIDATION', 400)
  const { plan, interval } = parsed.data

  const user = await db.user.findUnique({ where: { id: session.id } })
  if (!user) return fail('Not signed in.', 'UNAUTHORIZED', 401)
  if (user.plan !== 'FREE') return fail('You already have a paid plan. Use Manage billing on your dashboard to change it.', 'ALREADY_PAID', 409)

  try {
    const s = stripe()
    let customer = user.stripeCustomerId
    if (!customer) {
      customer = (await s.customers.create({ email: user.email, name: user.name, metadata: { userId: user.id } })).id
      await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer } })
    }
    const meta = { userId: user.id, plan }
    const checkout = await s.checkout.sessions.create({
      mode: 'subscription',
      customer,
      line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: PRICES[plan][interval], recurring: { interval }, product_data: { name: `Loopdesk ${PLAN_NAME[plan]}` } } }],
      subscription_data: { trial_period_days: 14, metadata: meta },
      metadata: meta,
      success_url: `${appUrl()}/dashboard?upgraded=1`,
      cancel_url: `${appUrl()}/pricing`,
    })
    return NextResponse.json({ url: checkout.url })
  } catch (e) {
    console.error('Checkout failed:', e)
    return fail('Could not start checkout. Please try again.', 'STRIPE', 500)
  }
}
