import { db } from './db'

// Everything the public review page needs, found by the unguessable token (no login)
export async function getReview(token: string) {
  const project = await db.project.findUnique({
    where: { reviewToken: token },
    select: {
      name: true,
      status: true,
      versions: {
        orderBy: { number: 'desc' },
        take: 1,
        select: {
          id: true, number: true, fileUrl: true, fileType: true,
          comments: { orderBy: { createdAt: 'asc' }, select: { id: true, authorName: true, isOwner: true, body: true, x: true, y: true, resolved: true, createdAt: true } },
          approval: { select: { approverName: true, createdAt: true } },
        },
      },
    },
  })
  if (!project) return null
  const v = project.versions[0]
  return {
    name: project.name,
    status: project.status,
    version: v && {
      ...v,
      comments: v.comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
      approval: v.approval && { approverName: v.approval.approverName, createdAt: v.approval.createdAt.toISOString() },
    },
  }
}
export type ReviewData = Awaited<ReturnType<typeof getReview>>

// Clients always review the newest version
export const latestVersion = (token: string) =>
  db.version.findFirst({
    where: { project: { reviewToken: token } },
    orderBy: { number: 'desc' },
    select: { id: true, projectId: true, approval: { select: { id: true } }, _count: { select: { comments: true } } },
  })
