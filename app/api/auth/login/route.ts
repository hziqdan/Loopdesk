import { NextResponse } from 'next/server'
import { checkPassword, createSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { loginSchema } from '@/lib/validators'

// Compared against when the email doesn't exist, so response time doesn't reveal which emails are registered
const DUMMY = '$2b$12$A/8Ln6V2GaB7I/LZ/oxvU.nG5CLwKBbQzfyh5lh4apItBT6DkFOAO'
const bad = () => NextResponse.json({ error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' }, { status: 401 })

export async function POST(req: Request) {
  const limited = await rateLimit(req, 'login', 10, 15 * 60 * 1000) // 10 attempts per 15 minutes per visitor
  if (limited) return limited

  const parsed = loginSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message, code: 'VALIDATION' }, { status: 400 })
  const { email, password } = parsed.data

  const user = await db.user.findUnique({ where: { email } })
  const ok = await checkPassword(password, user?.passwordHash ?? DUMMY)
  if (!user || !ok) return bad()

  await createSession(user.id)
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, plan: user.plan } })
}
