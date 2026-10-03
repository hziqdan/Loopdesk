import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getUser } from '@/lib/auth'
import { db } from '@/lib/db'

// Owner only: mark a comment resolved or reopen it
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Not signed in.', code: 'UNAUTHORIZED' }, { status: 401 })
  const parsed = z.object({ resolved: z.boolean() }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request.', code: 'VALIDATION' }, { status: 400 })

  // Ownership check goes through version -> project -> owner
  const comment = await db.comment.findFirst({ where: { id: params.id, version: { project: { ownerId: user.id } } }, select: { id: true } })
  if (!comment) return NextResponse.json({ error: 'Comment not found.', code: 'NOT_FOUND' }, { status: 404 })

  const updated = await db.comment.update({ where: { id: comment.id }, data: { resolved: parsed.data.resolved } })
  return NextResponse.json({ comment: updated })
}
