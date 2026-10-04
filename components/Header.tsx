'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { nav } from '@/lib/content'

type HeaderUser = { name: string; plan: string } | null

// Signed-in people get app navigation; visitors get the marketing links
const appNav = [['/dashboard', 'Projects'], ['/pricing', 'Plans'], ['/contact', 'Support']]

export default function Header({ user }: { user: HeaderUser }) {
  const path = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const links = user ? appNav : nav
  const active = (href: string) => (href === '/dashboard' ? path.startsWith('/dashboard') : path === href) // project pages count as "Projects"
  const first = user?.name.split(' ')[0] ?? ''
  const plan = user ? user.plan.charAt(0) + user.plan.slice(1).toLowerCase() : ''

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg">
      <div className="wrap flex h-16 items-center justify-between">
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 text-xl font-extrabold">
          <i className="h-[22px] w-[22px] rounded-full border-[5px] border-brand" />Loopdesk
        </Link>
        <nav aria-label="Main" className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-16 flex-col border-b border-line bg-bg px-6 pb-4 md:static md:flex md:flex-row md:gap-6 md:border-0 md:p-0`}>
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active(href) ? 'page' : undefined}
              className={`py-3 text-[15px] font-medium md:py-0 ${active(href) ? 'text-ink' : 'text-mute hover:text-ink'}`}>{label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden items-center gap-2 pr-1 text-[15px] md:flex">
                <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-full bg-soft text-sm font-bold text-brand">{first.charAt(0).toUpperCase()}</span>
                <span className="font-medium">{first}</span>
                <span className="rounded-full bg-soft px-2 py-0.5 text-xs font-semibold text-brand">{plan}</span>
              </span>
              <button onClick={logout} className="btn !px-3 !py-1.5 text-sm">Log out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden px-2 text-[15px] font-medium text-mute hover:text-ink sm:block">Log in</Link>
              <Link href="/signup" className="btn btn-p">Start free</Link>
            </>
          )}
          <button className="h-10 w-10 rounded-xl border border-line md:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
        </div>
      </div>
    </header>
  )
}
