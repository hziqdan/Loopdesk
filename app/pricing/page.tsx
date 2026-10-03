import type { Metadata } from 'next'
import Link from 'next/link'
import PricingPlans from '@/components/PricingPlans'
import { Faq, PageHero } from '@/components/ui'
import { priceFaq } from '@/lib/content'
export const metadata: Metadata = { title: 'Pricing' }

export default function Pricing() {
  return (
    <>
      <PageHero title="Simple pricing. Start free, upgrade when you grow." sub="Every paid plan starts with a 14-day free trial. Cancel anytime." />
      <section className="px-6 pb-14 text-center md:pb-24"><div className="wrap">
        <PricingPlans />
        <p className="mt-6 text-sm text-mute">No contracts. No hidden fees. Secure payments via Stripe. Need more than 10 seats? <Link href="/contact" className="text-brand underline">Talk to us</Link>.</p></div></section>
      <section className="sec border-y border-line bg-card"><div className="wrap"><h2>Pricing questions</h2><Faq items={priceFaq} /></div></section>
    </>
  )
}
