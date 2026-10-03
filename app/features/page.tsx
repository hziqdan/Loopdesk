import type { Metadata } from 'next'
import { Button, Cards, Cta, PageHero } from '@/components/ui'
import { features } from '@/lib/content'
export const metadata: Metadata = { title: 'Features' }

export default function Features() {
  return (
    <>
      <PageHero title="Every piece of feedback, in one place." sub="Collect clear comments, track every version, and get sign-off without a single email thread.">
        <div className="btns"><Button href="/signup">Start free</Button></div></PageHero>
      <section className="sec border-y border-line bg-card pt-8"><div className="wrap">
        <Cards items={features} /><div className="btns"><Button href="/#demo" primary={false}>Want to see it work? Try the live demo</Button></div></div></section>
      <Cta title="Give your clients an easier way to say yes." sub="Start free. No credit card required." />
    </>
  )
}
