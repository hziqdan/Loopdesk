import type { Metadata } from 'next'
import { Cta, PageHero } from '@/components/ui'
export const metadata: Metadata = { title: 'Case studies' }
const stats = [['60%', 'fewer revision rounds'], ['Same day', 'approvals on most projects'], ['6 hrs', 'saved per week']]
const story = [['The challenge', 'Client feedback arrived across email, chat, and calls, and nobody knew which version was current.'], ['The approach', 'The team moved every review into Loopdesk, with one link per project.'], ['The result', 'Clients leave pinned comments, and the team resolves them in order.']]

export default function CaseStudies() {
  return (
    <>
      <PageHero title="Real teams, faster approvals." sub="See how freelancers and studios cut revision rounds with Loopdesk." />
      <section className="sec border-y border-line bg-card pt-8"><div className="wrap max-w-[900px]">
        <article className="card text-left">
          <h2>How Studio Kopi cut revision rounds from five to two.</h2>
          <p className="mt-2 text-mute">A four-person branding studio stopped losing feedback in email.</p>
          <div className="my-7 flex flex-wrap gap-x-12 gap-y-4">{stats.map(([n, l]) => <div key={l}><b className="block text-3xl font-extrabold">{n}</b><span className="text-sm text-mute">{l}</span></div>)}</div>
          {story.map(([h, p]) => <div key={h} className="mt-5"><h3>{h}</h3><p className="mt-1 text-mute">{p}</p></div>)}
          <p className="mt-7 text-xl font-semibold">&quot;Clients actually enjoy reviewing now.&quot; <span className="text-base font-normal text-mute">Sarah Lim, Founder</span></p>
        </article>
        <p className="mt-5 text-sm text-mute">Sample case study for a demo project.</p></div></section>
      <Cta title="Get results like Studio Kopi." sub="Free for 2 projects. No credit card required." />
    </>
  )
}
