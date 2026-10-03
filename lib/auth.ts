import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { db } from './db'

export const COOKIE = 'ld_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const secret = () => {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(s)
}

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12)
export const checkPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash)

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret())
  cookies().set(COOKIE, token, {
    httpOnly: true, // JavaScript can't read it, so XSS can't steal it
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export const clearSession = () => cookies().delete(COOKIE)

export async function getUser() {
  const token = cookies().get(COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    return await db.user.findUnique({
      where: { id: String(payload.sub) },
      select: { id: true, name: true, email: true, plan: true, createdAt: true },
    })
  } catch {
    return null
  }
}
