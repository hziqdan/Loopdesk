import type { Plan } from '@prisma/client'

const MB = 1024 * 1024
const GB = 1024 * MB

// Enforced on the server. Anything checked only in the browser can be bypassed.
export const LIMITS: Record<Plan, { projects: number; versions: number; storage: number }> = {
  FREE: { projects: 2, versions: 3, storage: 1 * GB },
  PRO: { projects: Infinity, versions: Infinity, storage: 50 * GB },
  STUDIO: { projects: Infinity, versions: Infinity, storage: 200 * GB },
}
export const MAX_FILE = 50 * MB // matches Supabase's free-plan per-file cap

export const FILE_KINDS: Record<string, string> = {
  'image/png': 'image', 'image/jpeg': 'image', 'image/webp': 'image', 'image/gif': 'image',
  'application/pdf': 'pdf', 'video/mp4': 'video', 'video/quicktime': 'video',
}

export const fmtBytes = (n: number) =>
  n >= GB ? `${(n / GB).toFixed(1)} GB` : n >= MB ? `${(n / MB).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`
export const fmtLimit = (n: number) => (n === Infinity ? 'unlimited' : String(n))
