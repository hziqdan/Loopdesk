import { describe, expect, it } from 'vitest'
import { loginSchema, signupSchema } from '@/lib/validators'

describe('signupSchema', () => {
  it('accepts valid input and normalises the email', () => {
    const r = signupSchema.safeParse({ name: '  Ana ', email: '  ANA@Example.com ', password: 'longenough' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toMatchObject({ name: 'Ana', email: 'ana@example.com' })
  })
  it('rejects a password shorter than 8 characters', () => {
    const r = signupSchema.safeParse({ name: 'Ana', email: 'ana@example.com', password: 'short' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].message).toBe('Password needs at least 8 characters.')
  })
  it('rejects a bad email and an empty name', () => {
    expect(signupSchema.safeParse({ name: 'Ana', email: 'not-an-email', password: 'longenough' }).success).toBe(false)
    expect(signupSchema.safeParse({ name: '   ', email: 'ana@example.com', password: 'longenough' }).success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('requires a password', () => {
    expect(loginSchema.safeParse({ email: 'ana@example.com', password: '' }).success).toBe(false)
    expect(loginSchema.safeParse({ email: 'ana@example.com', password: 'x' }).success).toBe(true)
  })
})
