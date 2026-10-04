import { redirect } from 'next/navigation'
import PinDemo from '@/components/PinDemo'
import { Button, Cards, Cta, Faq } from '@/components/ui'
import { getUser } from '@/lib/auth'
import { homeFaq, problems, steps, testimonials } from '@/lib/content'

export default async function Home() {
  if (await getUser()) redirect('/dashboard') // signed-in people land on their own projects, not the sales page

  return (
    <>
      <section className="py-14 md:py-24"><div className="wrap grid items-center gap-12 text-center md:grid-cols-2 md:text-left">
        <div>
          <h1>Get client approval in hours, not weeks.</h1>
          <p className="mt-4 text-lg text-mute">Clients comment right on your designs, videos, and documents, then approve with one click.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start"><Button href="/signup">Start free</Button><Button href="#demo" primary={false}>Try the live demo</Button></div>
          <p className="mt-4 text-sm text-mute">✓ No credit card &nbsp;✓ Free for 2 projects &nbsp;✓ Set up in 2 minutes</p>
        </div>
        <PinDemo />
      </div></section>
      <section className="sec border-y border-line bg-card"><div className="wrap">
        <h2>Feedback shouldn&apos;t feel like detective work.</h2><Cards items={problems} /></div></section>
      <section className="sec"><div className="wrap"><h2>From upload to approved in three steps.</h2>
        <div className="grid-auto">{steps.map(([h, p], i) => (
          <div key={h}><div className="mb-2 text-2xl font-extrabold text-brand">{i + 1}</div><h3>{h}</h3><p className="mt-1.5 text-mute">{p}</p></div>))}</div>
        <div className="btns"><Button href="/features" primary={false}>See all features</Button></div></div></section>
      <section className="sec border-y border-line bg-card"><div className="wrap"><h2>Loved by people who hate chasing feedback.</h2>
        <div className="grid-auto">{testimonials.map(([q, n, r]) => (
          <div key={n} className="card"><p>{q}</p><p className="mt-4 text-mute"><b className="text-ink">{n}</b>, {r}</p></div>))}</div>
        <div className="btns"><Button href="/case-studies" primary={false}>Read the case study</Button></div></div></section>
      <section className="sec"><div className="wrap"><h2>Questions, answered.</h2><Faq items={homeFaq} /></div></section>
      <Cta title="Ready to stop chasing feedback?" sub="Join 2,000+ creatives who get approved faster." />
    </>
  )
}
