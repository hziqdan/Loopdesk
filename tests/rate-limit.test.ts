import { beforeEach, describe, expect, it, vi } from 'vitest'

const rl = vi.hoisted(() => ({ count: vi.fn(), findFirst: vi.fn(), create: vi.fn(), deleteMany: vi.fn() }))
vi.mock('@/lib/db', () => ({ db: { rateLimit: rl } }))
import { rateLimit } from '@/lib/rate-limit'

const req = (ip = '203.0.113.9') => new Request('http://localhost/api/x', { method: 'POST', headers: { 'x-forwarded-for': `${ip}, 10.0.0.1` } })

beforeEach(() => {
  vi.resetAllMocks()
  vi.spyOn(Math, 'random').mockReturnValue(0.5) // skip the occasional clean-up
})

describe('rateLimit', () => {
  it('lets a request through and records it', async () => {
    rl.count.mockResolvedValue(2)
    expect(await rateLimit(req(), 'contact', 3, 60_000)).toBeNull()
    expect(rl.create).toHaveBeenCalledTimes(1)
  })
  it('blocks at the limit with a 429 and a Retry-After header', async () => {
    rl.count.mockResolvedValue(3)
    rl.findFirst.mockResolvedValue({ createdAt: new Date(Date.now() - 30_000) })
    const res = await rateLimit(req(), 'contact', 3, 60_000)
    expect(res?.status).toBe(429)
    expect(Number(res?.headers.get('Retry-After'))).toBeGreaterThan(0)
    expect((await res!.json()).code).toBe('RATE_LIMITED')
    expect(rl.create).not.toHaveBeenCalled()
  })
  it('never stores the raw IP address', async () => {
    rl.count.mockResolvedValue(0)
    await rateLimit(req('203.0.113.9'), 'login', 10, 60_000)
    const key = rl.count.mock.calls[0][0].where.key as string
    expect(key.startsWith('login:')).toBe(true)
    expect(key).not.toContain('203.0.113.9')
  })
  it('counts each scope separately', async () => {
    rl.count.mockResolvedValue(0)
    await rateLimit(req(), 'login', 10, 60_000)
    await rateLimit(req(), 'signup', 5, 60_000)
    expect(rl.count.mock.calls[0][0].where.key).not.toBe(rl.count.mock.calls[1][0].where.key)
  })
  it('fails open if the database is down', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    rl.count.mockRejectedValue(new Error('db down'))
    expect(await rateLimit(req(), 'login', 10, 60_000)).toBeNull()
  })
})
