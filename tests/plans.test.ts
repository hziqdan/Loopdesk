import { describe, expect, it } from 'vitest'
import { FILE_KINDS, LIMITS, MAX_FILE, fmtBytes, fmtLimit } from '@/lib/plans'

describe('plan limits (enforced on the server)', () => {
  it('Free allows 2 projects, 3 versions and 1 GB', () => {
    expect(LIMITS.FREE).toEqual({ projects: 2, versions: 3, storage: 1024 ** 3 })
  })
  it('paid plans have unlimited projects and more storage', () => {
    for (const plan of ['PRO', 'STUDIO'] as const) {
      expect(LIMITS[plan].projects).toBe(Infinity)
      expect(LIMITS[plan].storage).toBeGreaterThan(LIMITS.FREE.storage)
    }
  })
})

describe('uploads', () => {
  it('accepts images, PDFs and video', () => {
    expect(FILE_KINDS['image/png']).toBe('image')
    expect(FILE_KINDS['application/pdf']).toBe('pdf')
    expect(FILE_KINDS['video/mp4']).toBe('video')
  })
  it('rejects executables and scripts', () => {
    expect(FILE_KINDS['application/x-msdownload']).toBeUndefined()
    expect(FILE_KINDS['text/html']).toBeUndefined()
  })
  it('caps a single file at 50 MB', () => expect(MAX_FILE).toBe(50 * 1024 * 1024))
})

describe('formatting', () => {
  it('formats sizes and limits for people', () => {
    expect(fmtBytes(500)).toBe('1 KB')
    expect(fmtBytes(1.5 * 1024 * 1024)).toBe('1.5 MB')
    expect(fmtBytes(1024 ** 3)).toBe('1.0 GB')
    expect(fmtLimit(Infinity)).toBe('unlimited')
    expect(fmtLimit(2)).toBe('2')
  })
})
