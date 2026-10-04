import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { commentEmail, sendEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
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

const EMAIL_GAP_MS = 5 * 60 * 1000 // at most one comment email per project every 5 minutes

// Public route: anyone with the review link can comment, so every input is validated here
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const limited = await rateLimit(req, 'comment', 30, 10 * 60 * 1000)
  if (limited) return limited

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

  // Notify the owner, but not on every comment: claim the 5-minute slot atomically so two
  // simultaneous comments cannot both send, then include everything posted since the last email
  try {
    const last = version.project.lastCommentEmailAt
    const claimed = await db.project.updateMany({
      where: { id: version.projectId, OR: [{ lastCommentEmailAt: null }, { lastCommentEmailAt: { lt: new Date(Date.now() - EMAIL_GAP_MS) } }] },
      data: { lastCommentEmailAt: new Date() },
    })
    if (claimed.count === 1) {
      const fresh = await db.comment.findMany({
        where: { version: { projectId: version.projectId }, createdAt: { gt: last ?? new Date(0) } },
        orderBy: { createdAt: 'asc' }, take: 5, select: { authorName: true, body: true },
      })
      const mail = commentEmail(version.project.name, version.projectId, fresh)
      await sendEmail(version.project.owner.email, mail.subject, mail.html)
    }
  } catch (e) {
    console.error('Comment notification failed:', e)
  }
  return NextResponse.json({ comment }, { status: 201 })
}
