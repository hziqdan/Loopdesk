import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { storage } from '@/lib/storage'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Not signed in.', code: 'UNAUTHORIZED' }, { status: 401 })

  // Ownership check: the project must belong to the signed-in user
  const project = await db.project.findFirst({ where: { id: params.id, ownerId: user.id }, include: { versions: { select: { filePath: true } } } })
  if (!project) return NextResponse.json({ error: 'Project not found.', code: 'NOT_FOUND' }, { status: 404 })

  const paths = project.versions.map((v) => v.filePath)
  if (paths.length) await storage().remove(paths) // best effort: free the storage space
  await db.project.delete({ where: { id: project.id } }) // versions are deleted by the cascade
  return NextResponse.json({ ok: true })
}
