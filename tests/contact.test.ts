import { beforeEach, describe, expect, it, vi } from 'vitest'

const m = vi.hoisted(() => ({ create: vi.fn(), send: vi.fn(), limit: vi.fn() }))
vi.mock('@/lib/db', () => ({ db: { contactMessage: { create: m.create } } }))
vi.mock('@/lib/rate-limit', () => ({ rateLimit: m.limit }))
vi.mock('@/lib/email', async (orig) => ({ ...(await orig<typeof import('@/lib/email')>()), sendEmail: m.send }))
import { POST } from '@/app/api/contact/route'

const post = (body: unknown) => POST(new Request('http://localhost/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }))
const valid = { name: 'Ana', email: 'ana@example.com', message: 'Hello, can you help me?' }

beforeEach(() => {
  vi.resetAllMocks()
  m.limit.mockResolvedValue(null)
  delete process.env.CONTACT_TO_EMAIL
})

describe('POST /api/contact', () => {
  it('saves a valid message', async () => {
    const res = await post(valid)
    expect(res.status).toBe(201)
    expect(m.create).toHaveBeenCalledWith({ data: valid })
  })
  it('rejects an invalid email with a readable error', async () => {
    const res = await post({ ...valid, email: 'nope' })
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('Enter a valid email address.')
    expect(m.create).not.toHaveBeenCalled()
  })
  it('rejects a message that is too short or too long', async () => {
    expect((await post({ ...valid, message: 'hi' })).status).toBe(400)
    expect((await post({ ...valid, message: 'x'.repeat(2001) })).status).toBe(400)
  })
  it('rejects a body that is not JSON', async () => {
    const res = await POST(new Request('http://localhost/api/contact', { method: 'POST', body: 'garbage' }))
    expect(res.status).toBe(400)
  })
  it('quietly drops bot submissions that fill the honeypot', async () => {
    const res = await post({ ...valid, website: 'http://spam.example' })
    expect(res.status).toBe(201)
    expect(m.create).not.toHaveBeenCalled()
  })
  it('stops when the visitor is rate limited', async () => {
    m.limit.mockResolvedValue(new Response(JSON.stringify({ code: 'RATE_LIMITED' }), { status: 429 }))
    expect((await post(valid)).status).toBe(429)
    expect(m.create).not.toHaveBeenCalled()
  })
  it('returns a server error if saving fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    m.create.mockRejectedValue(new Error('db'))
    expect((await post(valid)).status).toBe(500)
  })
  it('emails the owner with the message escaped, when CONTACT_TO_EMAIL is set', async () => {
    process.env.CONTACT_TO_EMAIL = 'me@example.com'
    await post({ ...valid, message: '<script>alert(1)</script>' })
    expect(m.send).toHaveBeenCalledTimes(1)
    const [to, , html] = m.send.mock.calls[0]
    expect(to).toBe('me@example.com')
    expect(html).not.toContain('<script>')
  })
})
