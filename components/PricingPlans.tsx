'use client'
import Link from 'next/link'
import { useState } from 'react'
import { plans } from '@/lib/content'

export default function PricingPlans() {
  const [yearly, setYearly] = useState(false)
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
      <div className="grid-auto">
        {plans.map((p) => (
          <div key={p.name} className={`card relative ${p.hi ? '!border-2 !border-brand' : ''}`}>
            {p.hi && <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-0.5 text-xs font-semibold text-white">Most popular</span>}
            <h3>{p.name}</h3><p className="mt-2 text-mute">{p.blurb}</p>
            <div className="mt-2 text-[2.6rem] font-extrabold">${yearly ? p.y : p.m}{p.m > 0 && <small className="text-base font-normal text-mute">/mo</small>}</div>
            <ul className="my-5">{p.rows.map(([a, b]) => <li key={a} className="flex justify-between border-t border-line py-2 text-[15px]">{a}<span className="text-mute">{b}</span></li>)}</ul>
            <Link href="/signup" className={`btn block text-center ${p.hi ? 'btn-p' : ''}`}>{p.cta}</Link>
          </div>
        ))}
      </div>
    </>
  )
}
