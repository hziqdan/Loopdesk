import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { latestVersion } from '@/lib/review'

const fail = (error: string, code: string, status: number) => NextResponse.json({ error, code }, { status })
const pos = z.number().min(0).max(100).nullish()
const schema = z
  .object({
    authorName: z.string().trim().min(1, 'Enter your name.').max(60),
    body: z.string().trim().min(1, 'Write a comment first.').max(1000),
    x: pos,
    y: pos,
  })
  .refine((d) => (d.x == null) === (d.y == null), 'A pin needs both x and y.')

// Public route: anyone with the review link can comment, so every input is validated here
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail(parsed.error.issues[0].message, 'VALIDATION', 400)

  const version = await latestVersion(params.token)
  if (!version) return fail('Review link not found.', 'NOT_FOUND', 404)
  if (version.approval) return fail('This version is already approved.', 'ALREADY_APPROVED', 409)
  if (version._count.comments >= 200) return fail('This version has reached its comment limit.', 'LIMIT', 429)

  const { authorName, body, x, y } = parsed.data
  const comment = await db.comment.create({
    data: { versionId: version.id, authorName, body, x: x ?? null, y: y ?? null },
    select: { id: true, authorName: true, isOwner: true, body: true, x: true, y: true, resolved: true, createdAt: true },
  })
  return NextResponse.json({ comment }, { status: 201 })
}
