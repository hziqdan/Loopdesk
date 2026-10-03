import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import CommentList from '@/components/CommentList'
import CopyLink from '@/components/CopyLink'
import DeleteProjectButton from '@/components/DeleteProjectButton'
import UploadVersion from '@/components/UploadVersion'
import { getUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { LIMITS, fmtBytes, fmtLimit } from '@/lib/plans'
export const metadata: Metadata = { title: 'Project' }

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) redirect('/login')
  // Ownership check: someone else's project id returns 404, not their data
  const project = await db.project.findFirst({
    where: { id: params.id, ownerId: user.id },
    include: { versions: { orderBy: { number: 'desc' }, include: { comments: { orderBy: { createdAt: 'asc' } }, approval: true } } },
  })
  if (!project) notFound()
  const maxVersions = LIMITS[user.plan].versions
  const latest = project.versions[0]
  const open = latest ? latest.comments.filter((c) => !c.resolved).length : 0
  const link = `/r/${project.reviewToken}`

  return (
    <section className="py-14 md:py-20"><div className="wrap max-w-[900px]">
      <Link href="/dashboard" className="text-sm text-mute hover:text-ink">← All projects</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="!text-3xl">{project.name}</h1>
          <p className="mt-1 text-sm text-mute">{project.status === 'APPROVED' ? 'Approved ✓' : 'In review'} · {project.versions.length} of {fmtLimit(maxVersions)} versions</p></div>
        <DeleteProjectButton id={project.id} />
      </div>

      <div className="card mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3>Client review link</h3>
          <div className="flex gap-2"><CopyLink path={link} /><a href={link} target="_blank" rel="noreferrer" className="btn !px-3 !py-1.5 text-sm">Open</a></div></div>
        <p className="mt-1 break-all font-mono text-sm text-mute">{link}</p>
        <p className="mt-1 text-sm text-mute">Anyone with this link can comment and approve the latest version, with no account.</p>
      </div>

      {latest?.approval && (
        <p className="mt-4 rounded-xl border border-line bg-card p-4 text-sm">✓ v{latest.number} approved by <b>{latest.approval.approverName}</b> ({latest.approval.approverEmail}) on {latest.approval.createdAt.toLocaleString('en-GB')}.</p>
      )}

      {latest && (<>
        <h2 className="mt-10 !text-2xl">Feedback on v{latest.number} <span className="text-base font-normal text-mute">({open} open)</span></h2>
        <CommentList comments={latest.comments} />
      </>)}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3"><h2 className="!text-2xl">Versions</h2><UploadVersion projectId={project.id} /></div>
      {project.versions.length === 0 ? (
        <div className="card mt-4 text-center"><p className="text-mute">No files yet. Upload a design, PDF or video to create v1.</p></div>
      ) : (
        <ul className="mt-4 grid gap-3">
          {project.versions.map((v) => (
            <li key={v.id} className="card flex items-center gap-4 !p-4">
              {v.fileType === 'image'
                ? <img src={v.fileUrl} alt={`Version ${v.number}`} loading="lazy" className="h-16 w-24 rounded-lg border border-line object-cover" />
                : <div className="grid h-16 w-24 place-items-center rounded-lg bg-soft text-sm font-semibold uppercase text-brand">{v.fileType}</div>}
              <div className="flex-1"><b>v{v.number}</b><p className="text-sm text-mute">{fmtBytes(v.fileSize)} · {v.comments.length} comments{v.approval ? ' · Approved' : ''}</p></div>
              <a href={v.fileUrl} target="_blank" rel="noreferrer" className="btn">Open</a>
            </li>
          ))}
        </ul>
      )}
    </div></section>
  )
}
