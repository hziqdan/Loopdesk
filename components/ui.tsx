import Link from 'next/link'
import type { ReactNode } from 'react'

export const Button = ({ href, children, primary = true }: { href: string; children: ReactNode; primary?: boolean }) => (
  <Link href={href} className={primary ? 'btn btn-p' : 'btn'}>{children}</Link>
)
export const PageHero = ({ title, sub, children }: { title: string; sub: string; children?: ReactNode }) => (
  <section className="sec pb-8"><div className="wrap"><h1>{title}</h1><p className="lead">{sub}</p>{children}</div></section>
)
export const Cta = ({ title, sub, label = 'Start free', href = '/signup' }: { title: string; sub: string; label?: string; href?: string }) => (
  <section className="py-14 text-center md:py-24"><div className="wrap">
    <div className="rounded-3xl bg-brand px-6 py-12 text-white md:py-[72px]"><h2>{title}</h2>
      <p className="lead !text-indigo-100">{sub}</p>
      <div className="btns"><Link href={href} className="btn !border-white !bg-white !text-brand">{label}</Link></div></div></div></section>
)
export const Faq = ({ items }: { items: string[][] }) => (
  <div className="mx-auto mt-10 max-w-[720px] text-left">
    {items.map(([q, a]) => (
      <details key={q} className="group border-b border-line py-4">
        <summary className="flex cursor-pointer list-none justify-between font-semibold">{q}<span className="text-mute group-open:hidden">+</span><span className="hidden text-mute group-open:inline">−</span></summary>
        <p className="mt-2 text-mute">{a}</p>
      </details>
    ))}
  </div>
)
export const Cards = ({ items }: { items: string[][] }) => (
  <div className="grid-auto">
    {items.map(([h, p, r]) => (
      <div key={h} className="card"><h3>{h}</h3><p className="mt-2 text-mute">{p}</p>{r && <p className="mt-2.5 text-sm font-semibold text-ok">{r}</p>}</div>
    ))}
  </div>
)
