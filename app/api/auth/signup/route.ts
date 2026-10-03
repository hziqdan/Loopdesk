import { NextResponse } from 'next/server'
import { createSession, hashPassword } from '@/lib/auth'
import { db } from '@/lib/db'
import { signupSchema } from '@/lib/validators'

const fail = (error: string, code: string, status: number) => NextResponse.json({ error, code }, { status })

export async function POST(req: Request) {
  const parsed = signupSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail(parsed.error.issues[0].message, 'VALIDATION', 400)
  const { name, email, password } = parsed.data

  if (await db.user.findUnique({ where: { email } })) return fail('An account with this email already exists.', 'EMAIL_TAKEN', 409)
  try {
    const user = await db.user.create({ data: { name, email, passwordHash: await hashPassword(password) } })
    await createSession(user.id)
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, plan: user.plan } }, { status: 201 })
  } catch (e: any) {
    if (e?.code === 'P2002') return fail('An account with this email already exists.', 'EMAIL_TAKEN', 409) // two signups raced
    console.error(e)
    return fail('Something went wrong. Please try again.', 'SERVER', 500)
  }
}
