import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { LIMITS, fmtLimit } from '@/lib/plans'

const fail = (error: string, code: string, status: number) => NextResponse.json({ error, code }, { status })
const schema = z.object({ name: z.string().trim().min(1, 'Give the project a name.').max(80) })

export async function GET() {
  const user = await getUser()
  if (!user) return fail('Not signed in.', 'UNAUTHORIZED', 401)
  const projects = await db.project.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { versions: true } } },
  })
  return NextResponse.json({ projects })
}

export async function POST(req: Request) {
  const user = await getUser()
  if (!user) return fail('Not signed in.', 'UNAUTHORIZED', 401)
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail(parsed.error.issues[0].message, 'VALIDATION', 400)

  const limit = LIMITS[user.plan].projects
  if ((await db.project.count({ where: { ownerId: user.id } })) >= limit)
    return fail(`Your ${user.plan} plan allows ${fmtLimit(limit)} projects. Upgrade to add more.`, 'PLAN_LIMIT', 403)

  const project = await db.project.create({
    data: { name: parsed.data.name, ownerId: user.id, reviewToken: randomBytes(18).toString('base64url') },
  })
  return NextResponse.json({ project }, { status: 201 })
}
