'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { nav } from '@/lib/content'

export default function Header() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg">
      <div className="wrap flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold">
          <i className="h-[22px] w-[22px] rounded-full border-[5px] border-brand" />Loopdesk
        </Link>
        <nav aria-label="Main" className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-16 flex-col border-b border-line bg-bg px-6 pb-4 md:static md:flex md:flex-row md:gap-6 md:border-0 md:p-0`}>
          {nav.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={path === href ? 'page' : undefined}
              className={`py-3 text-[15px] font-medium md:py-0 ${path === href ? 'text-ink' : 'text-mute hover:text-ink'}`}>{label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden px-2 text-[15px] font-medium text-mute hover:text-ink sm:block">Log in</Link>
          <Link href="/signup" className="btn btn-p">Start free</Link>
          <button className="h-10 w-10 rounded-xl border border-line md:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
        </div>
      </div>
    </header>
  )
}
