import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { FILE_KINDS, LIMITS, MAX_FILE, fmtBytes, fmtLimit } from '@/lib/plans'
import { storage } from '@/lib/storage'

const fail = (error: string, code: string, status: number) => NextResponse.json({ error, code }, { status })
const schema = z.object({ fileName: z.string().min(1).max(200), fileType: z.string(), fileSize: z.number().int().positive() })

// Step 1 of an upload: check everything, then hand the browser a one-time signed upload URL
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return fail('Not signed in.', 'UNAUTHORIZED', 401)
  const project = await db.project.findFirst({ where: { id: params.id, ownerId: user.id }, include: { versions: { select: { number: true } } } })
  if (!project) return fail('Project not found.', 'NOT_FOUND', 404)

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail('Invalid upload request.', 'VALIDATION', 400)
  const { fileName, fileType, fileSize } = parsed.data

  if (!FILE_KINDS[fileType]) return fail('Unsupported file type. Use PNG, JPG, WebP, GIF, PDF, MP4 or MOV.', 'BAD_TYPE', 400)
  if (fileSize > MAX_FILE) return fail(`File is too large. The limit is ${fmtBytes(MAX_FILE)}.`, 'TOO_LARGE', 400)

  const limits = LIMITS[user.plan]
  if (project.versions.length >= limits.versions)
    return fail(`Your ${user.plan} plan allows ${fmtLimit(limits.versions)} versions per project. Upgrade for more.`, 'PLAN_LIMIT', 403)
  const used = (await db.version.aggregate({ _sum: { fileSize: true }, where: { project: { ownerId: user.id } } }))._sum.fileSize ?? 0
  if (used + fileSize > limits.storage)
    return fail(`This would pass your ${fmtBytes(limits.storage)} storage limit. Upgrade for more space.`, 'PLAN_LIMIT', 403)

  const number = Math.max(0, ...project.versions.map((v) => v.number)) + 1
  const ext = (fileName.split('.').pop() ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'bin'
  const path = `${project.id}/v${number}-${randomBytes(6).toString('hex')}.${ext}` // never trust the original file name

  const { data, error } = await storage().createSignedUploadUrl(path)
  if (error || !data) {
  console.error('Supabase signed upload error:', error)
  return fail('Could not start the upload. Please try again.', 'STORAGE', 500)
}
  return NextResponse.json({ path: data.path, token: data.token, number })
}
