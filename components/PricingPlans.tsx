'use client'
import Link from 'next/link'
import { useState } from 'react'
import { plans } from '@/lib/content'

type Props = { currentPlan: 'FREE' | 'PRO' | 'STUDIO' | null } // null = not signed in

export default function PricingPlans({ currentPlan }: Props) {
  const [yearly, setYearly] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState('')
  const onPaid = currentPlan !== null && currentPlan !== 'FREE'

  async function choose(name: string) {
    setBusy(name); setErr('')
    const res = await fetch('/api/billing/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: name.toUpperCase(), interval: yearly ? 'year' : 'month' }),
    })
    const j = await res.json().catch(() => ({}))
    if (res.status === 401) { window.location.href = '/signup'; return } // new visitors create an account first
    if (!res.ok) { setBusy(null); return setErr(j.error ?? 'Something went wrong.') }
    window.location.href = j.url // Stripe's hosted checkout page
  }

  function action(p: (typeof plans)[number]) {
    if (currentPlan === p.name.toUpperCase()) return <span aria-disabled="true" className="btn block cursor-default text-center opacity-70">Your current plan</span>
    if (onPaid) return <Link href="/dashboard" className="btn block text-center">Change in Manage billing</Link> // plan changes on a paid plan go through Stripe's portal
    if (p.m === 0) return <Link href="/signup" className="btn block text-center">{p.cta}</Link>
    return <button onClick={() => choose(p.name)} disabled={busy !== null} className={`btn block w-full text-center disabled:opacity-60 ${p.hi ? 'btn-p' : ''}`}>{busy === p.name ? 'Opening checkout…' : p.cta}</button>
  }

  return (
    <>
      <div className="inline-flex items-center gap-3 text-mute">
        <span>Monthly</span>
        <button role="switch" aria-checked={yearly} aria-label="Bill yearly" onClick={() => setYearly(!yearly)}
          className={`relative h-[26px] w-12 rounded-full ${yearly ? 'bg-brand' : 'bg-line'}`}>
          <span className={`absolute top-[3px] h-5 w-5 rounded-full bg-white transition-all ${yearly ? 'left-[25px]' : 'left-[3px]'}`} />
        </button>
        <span>Yearly (save 20%)</span>
      </div>
      <p role="status" className="mt-3 min-h-[1.4em] text-sm text-red-600">{err}</p>
      <div className="grid-auto !mt-4">
        {plans.map((p) => (
          <div key={p.name} className={`card relative ${p.hi ? '!border-2 !border-brand' : ''}`}>
            {p.hi && <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-0.5 text-xs font-semibold text-white">Most popular</span>}
            <h3>{p.name}</h3><p className="mt-2 text-mute">{p.blurb}</p>
            <div className="mt-2 text-[2.6rem] font-extrabold">${yearly ? p.y : p.m}{p.m > 0 && <small className="text-base font-normal text-mute">/mo</small>}</div>
            <ul className="my-5">{p.rows.map(([a, b]) => <li key={a} className="flex justify-between border-t border-line py-2 text-[15px]">{a}<span className="text-mute">{b}</span></li>)}</ul>
            {action(p)}
          </div>
        ))}
      </div>
    </>
  )
}
