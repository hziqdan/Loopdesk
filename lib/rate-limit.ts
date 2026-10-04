import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { db } from './db'

// The visitor is identified by a salted hash of their IP, so we never store the IP itself
export function clientKey(req: Request, scope: string) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown'
  const hash = createHash('sha256').update(ip + (process.env.JWT_SECRET ?? '')).digest('hex').slice(0, 24)
  return `${scope}:${hash}`
}

/**
 * Allow at most `max` requests per visitor per `windowMs`.
 * Returns a ready-made 429 response when over the limit, or null when the request may continue:
 *   const limited = await rateLimit(req, 'login', 10, 15 * 60 * 1000)
 *   if (limited) return limited
 * It is stored in the database, not in memory, because serverless hosts run many separate instances
 * that would not share an in-memory counter.
 */
export async function rateLimit(req: Request, scope: string, max: number, windowMs: number) {
  const key = clientKey(req, scope)
  try {
    const since = new Date(Date.now() - windowMs)
    const used = await db.rateLimit.count({ where: { key, createdAt: { gt: since } } })
    if (used >= max) {
      const oldest = await db.rateLimit.findFirst({ where: { key, createdAt: { gt: since } }, orderBy: { createdAt: 'asc' }, select: { createdAt: true } })
      const seconds = Math.max(1, Math.ceil(((oldest?.createdAt.getTime() ?? Date.now()) + windowMs - Date.now()) / 1000))
      const minutes = Math.ceil(seconds / 60)
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`, code: 'RATE_LIMITED' },
        { status: 429, headers: { 'Retry-After': String(seconds) } },
      )
    }
    await db.rateLimit.create({ data: { key } })
    if (Math.random() < 0.02) await db.rateLimit.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }) // tidy old rows now and then
  } catch (e) {
    // Fail open: if the limiter's own database call breaks, real users must still get in
    console.error('Rate limit check failed:', e)
  }
  return null
}
