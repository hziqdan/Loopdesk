import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { approvalEmail, sendEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { latestVersion } from '@/lib/review'

const fail = (error: string, code: string, status: number) => NextResponse.json({ error, code }, { status })
const schema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(60),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
})

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const limited = await rateLimit(req, 'approve', 10, 60 * 60 * 1000)
  if (limited) return limited

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail(parsed.error.issues[0].message, 'VALIDATION', 400)

  const version = await latestVersion(params.token)
  if (!version) return fail('Review link not found.', 'NOT_FOUND', 404)
  if (version.approval) return fail('This version is already approved.', 'ALREADY_APPROVED', 409)

  try {
    // Both writes succeed together or not at all
    const [approval] = await db.$transaction([
      db.approval.create({ data: { versionId: version.id, approverName: parsed.data.name, approverEmail: parsed.data.email } }),
      db.project.update({ where: { id: version.projectId }, data: { status: 'APPROVED' } }),
    ])
    // Approvals are rare and important, so always email the owner (a failure here never blocks the approval)
    const mail = approvalEmail(version.project.name, version.projectId, version.number, approval.approverName, approval.approverEmail)
    await sendEmail(version.project.owner.email, mail.subject, mail.html)
    return NextResponse.json({ approval: { approverName: approval.approverName, createdAt: approval.createdAt.toISOString() } }, { status: 201 })
  } catch (e: any) {
    if (e?.code === 'P2002') return fail('This version is already approved.', 'ALREADY_APPROVED', 409) // two people clicked at once
    console.error(e)
    return fail('Something went wrong. Please try again.', 'SERVER', 500)
  }
}
