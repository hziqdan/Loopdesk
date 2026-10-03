import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import NewProjectForm from '@/components/NewProjectForm'
import { getUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { LIMITS, fmtBytes, fmtLimit } from '@/lib/plans'
export const metadata: Metadata = { title: 'Dashboard' }

export default async function Dashboard() {
  const user = await getUser()
  if (!user) redirect('/login') // middleware checks the token; this confirms the user still exists

  const [projects, used] = await Promise.all([
    db.project.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: 'desc' }, include: { _count: { select: { versions: true } } } }),
    db.version.aggregate({ _sum: { fileSize: true }, where: { project: { ownerId: user.id } } }),
  ])
  const limits = LIMITS[user.plan]

  return (
    <section className="py-14 md:py-20"><div className="wrap max-w-[900px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="!text-3xl">Hi, {user.name}</h1>
          <p className="mt-1 text-mute">{user.email} · <span className="rounded-full bg-soft px-2.5 py-0.5 text-xs font-semibold text-brand">{user.plan} plan</span></p></div>
        <LogoutButton />
      </div>
      <p className="mt-4 text-sm text-mute">Projects {projects.length} of {fmtLimit(limits.projects)} · Storage {fmtBytes(used._sum.fileSize ?? 0)} of {fmtBytes(limits.storage)}</p>
      <NewProjectForm />
      {projects.length === 0 ? (
        <div className="card mt-2 text-center"><h2 className="!text-2xl">No projects yet</h2><p className="lead">Create your first project above, then upload a design to review.</p></div>
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
