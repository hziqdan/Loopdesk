import type { Metadata } from 'next'
import { Cards, Cta, PageHero } from '@/components/ui'
export const metadata: Metadata = { title: 'About' }
const stats = [['2,000+', 'creatives'], ['40,000+', 'projects approved'], ['4.9', 'average rating']]

export default function About() {
  return (
    <>
      <PageHero title="We built Loopdesk because feedback shouldn't take weeks." sub={'We\'re a small team of designers and developers who got tired of "v3_FINAL_final2."'} />
      <section className="sec border-y border-line bg-card"><div className="wrap"><h2>Our story</h2>
        <p className="lead">Loopdesk started with a simple frustration: a two-day design project that dragged on for three weeks, buried in email replies. We built the tool we wished we had, where clients can point, comment, and approve.</p></div></section>
      <section className="sec"><div className="wrap"><h2>What we believe</h2>
        <Cards items={[['Clarity beats politeness', 'Specific feedback makes better work.'], ["Clients shouldn't need training", "If it needs a tutorial, it's too complicated."], ['Your time is for creating', 'Not for chasing replies.']]} />
        <div className="mt-9 flex flex-wrap justify-center gap-x-12 gap-y-6">{stats.map(([n, l]) => <div key={l}><b className="block text-3xl font-extrabold">{n}</b><span className="text-sm text-mute">{l}</span></div>)}</div></div></section>
      <Cta title="Join them." sub="Start your first review in two minutes." />
    </>
  )
}
