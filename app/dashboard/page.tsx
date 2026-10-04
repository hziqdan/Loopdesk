import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import BillingButton from '@/components/BillingButton'
import NewProjectForm from '@/components/NewProjectForm'
import { getUser } from '@/lib/auth'
import { syncForUser } from '@/lib/billing'
import { db } from '@/lib/db'
import { LIMITS, fmtBytes, fmtLimit } from '@/lib/plans'
export const metadata: Metadata = { title: 'Dashboard' }

export default async function Dashboard({ searchParams }: { searchParams: { upgraded?: string } }) {
  const user = await getUser()
  if (!user) redirect('/login') // middleware checks the token; this confirms the user still exists

  // Just back from Stripe Checkout: don't wait for the webhook, read the subscription from Stripe now
  if (searchParams.upgraded) {
    try { await syncForUser(user.id) } catch (e) { console.error('Plan sync failed:', e) }
  }

  const openWhere = { resolved: false, version: { project: { ownerId: user.id } } }
  const [fresh, projects, used, sub, openCount, recent] = await Promise.all([
    db.user.findUnique({ where: { id: user.id }, select: { plan: true } }),
    db.project.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: 'desc' }, include: { _count: { select: { versions: true } } } }),
    db.version.aggregate({ _sum: { fileSize: true }, where: { project: { ownerId: user.id } } }),
    db.subscription.findUnique({ where: { userId: user.id } }),
    db.comment.count({ where: openWhere }),
    db.comment.findMany({
      where: openWhere, orderBy: { createdAt: 'desc' }, take: 5,
      select: { id: true, authorName: true, body: true, createdAt: true, version: { select: { number: true, project: { select: { id: true, name: true } } } } },
    }),
  ])
  const plan = fresh?.plan ?? user.plan
  const limits = LIMITS[plan]
  const paid = plan !== 'FREE'
  const inReview = projects.filter((p) => p.status === 'IN_REVIEW' && p._count.versions > 0).length
  const approved = projects.filter((p) => p.status === 'APPROVED').length

  return (
    <section className="py-12 md:py-16"><div className="wrap max-w-[900px]">
      {searchParams.upgraded && (
        <p role="status" className="mb-6 rounded-xl border border-line bg-soft p-4 text-sm">
          {paid ? `Your ${plan} plan is active. Thank you!` : 'We could not confirm your payment yet. Refresh in a few seconds, or open Manage billing to check.'}
        </p>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="!text-3xl">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-mute"><span className="rounded-full bg-soft px-2.5 py-0.5 text-xs font-semibold text-brand">{plan} plan</span>
            {sub?.status === 'TRIALING' && sub.currentPeriodEnd && <span className="ml-2 text-sm">Trial ends {sub.currentPeriodEnd.toLocaleDateString('en-GB')}</span>}
            {sub?.cancelAtPeriodEnd && sub.currentPeriodEnd && <span className="ml-2 text-sm">Cancels {sub.currentPeriodEnd.toLocaleDateString('en-GB')}</span>}</p></div>
        <div className="flex flex-wrap gap-2">
          {(paid || sub) && <BillingButton />}
          {!paid && <Link href="/pricing" className="btn btn-p">Upgrade</Link>}
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[[inReview, 'Projects in review'], [openCount, 'Open comments'], [approved, 'Approved projects']].map(([n, label]) => (
          <div key={label} className="card !p-5"><div className="text-3xl font-extrabold">{n}</div><div className="text-sm text-mute">{label}</div></div>
        ))}
      </div>
      <p className="mt-3 text-sm text-mute">Projects {projects.length} of {fmtLimit(limits.projects)} · Storage {fmtBytes(used._sum.fileSize ?? 0)} of {fmtBytes(limits.storage)}</p>

      <h2 className="mt-10 !text-2xl">Needs your attention</h2>
      {recent.length === 0 ? (
        <div className="card mt-3 text-center"><p className="text-mute">{projects.length === 0 ? 'Create a project below, upload a design, and share the review link with your client.' : "You're all caught up. New client comments will show up here."}</p></div>
      ) : (
        <ul className="mt-3 grid gap-2.5">
          {recent.map((c) => (
            <li key={c.id}>
              <Link href={`/dashboard/${c.version.project.id}`} className="card flex flex-wrap items-center gap-x-3 gap-y-1 !p-4 hover:border-brand">
                <b className="text-sm">{c.version.project.name}</b>
                <span className="text-sm text-mute">v{c.version.number} · {c.authorName}</span>
                <span className="w-full text-[15px]">{c.body.length > 90 ? `${c.body.slice(0, 90)}…` : c.body}</span>
              </Link>
            </li>
          ))}
          {openCount > recent.length && <li className="text-sm text-mute">and {openCount - recent.length} more open {openCount - recent.length === 1 ? 'comment' : 'comments'} in your projects.</li>}
        </ul>
      )}

      <h2 className="mt-10 !text-2xl">Your projects</h2>
      <NewProjectForm />
      {projects.length === 0 ? (
        <div className="card mt-2 text-center"><h3>No projects yet</h3><p className="lead">Name your first project above, then upload a design to review.</p></div>
      ) : (
        <div className="grid-auto !mt-2">
          {projects.map((p) => (
            <Link key={p.id} href={`/dashboard/${p.id}`} className="card block hover:border-brand">
              <h3>{p.name}</h3>
              <p className="mt-2 text-sm text-mute">{p._count.versions} {p._count.versions === 1 ? 'version' : 'versions'} · {p.status === 'APPROVED' ? 'Approved' : 'In review'}</p>
            </Link>
          ))}
        </div>
      )}
    </div></section>
  )
}
