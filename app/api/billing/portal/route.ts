import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { appUrl, stripe } from '@/lib/stripe'

// Opens Stripe's hosted page where the user can change plan, update their card or cancel
export async function POST() {
  const session = await getUser()
  if (!session) return NextResponse.json({ error: 'Not signed in.', code: 'UNAUTHORIZED' }, { status: 401 })
  const user = await db.user.findUnique({ where: { id: session.id }, select: { stripeCustomerId: true } })
  if (!user?.stripeCustomerId) return NextResponse.json({ error: 'No billing account yet.', code: 'NO_CUSTOMER' }, { status: 400 })
  try {
    const portal = await stripe().billingPortal.sessions.create({ customer: user.stripeCustomerId, return_url: `${appUrl()}/dashboard` })
    return NextResponse.json({ url: portal.url })
  } catch (e) {
    console.error('Portal failed:', e)
    return NextResponse.json({ error: 'Could not open billing. Please try again.', code: 'STRIPE' }, { status: 500 })
  }
}
