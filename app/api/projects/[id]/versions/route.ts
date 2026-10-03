import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { FILE_KINDS, LIMITS } from '@/lib/plans'
import { storage } from '@/lib/storage'

const fail = (error: string, code: string, status: number) => NextResponse.json({ error, code }, { status })
const schema = z.object({ path: z.string().min(1), fileType: z.string() })

// Step 2 of an upload: the file is in storage, so record it as a new version
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return fail('Not signed in.', 'UNAUTHORIZED', 401)
  const project = await db.project.findFirst({ where: { id: params.id, ownerId: user.id }, include: { versions: { select: { number: true } } } })
  if (!project) return fail('Project not found.', 'NOT_FOUND', 404)

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail('Invalid request.', 'VALIDATION', 400)
  const { path, fileType } = parsed.data
  const kind = FILE_KINDS[fileType]
  if (!kind || !path.startsWith(`${project.id}/`) || path.split('/').length !== 2) return fail('Invalid file.', 'VALIDATION', 400)
  if (project.versions.length >= LIMITS[user.plan].versions) return fail('Version limit reached for your plan.', 'PLAN_LIMIT', 403)

  // Read the real size from storage instead of trusting the browser
  const name = path.split('/')[1]
  const { data: files } = await storage().list(project.id, { search: name })
  const found = files?.find((f) => f.name === name)
  if (!found) return fail('Upload not found. Please try again.', 'NOT_UPLOADED', 400)
  const fileSize = Number(found.metadata?.size ?? 0)

  try {
    // A new version re-opens review, so the project goes back to IN_REVIEW in the same transaction
    const [version] = await db.$transaction([
      db.version.create({
        data: {
          projectId: project.id,
          number: Math.max(0, ...project.versions.map((v) => v.number)) + 1,
          filePath: path,
          fileUrl: storage().getPublicUrl(path).data.publicUrl,
          fileType: kind,
          fileSize,
        },
      }),
      db.project.update({ where: { id: project.id }, data: { status: 'IN_REVIEW' } }),
    ])
    return NextResponse.json({ version }, { status: 201 })
  } catch (e: any) {
    if (e?.code === 'P2002') return fail('Another upload finished first. Please try again.', 'CONFLICT', 409)
    console.error(e)
    return fail('Something went wrong. Please try again.', 'SERVER', 500)
  }
}
