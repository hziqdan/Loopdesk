'use client'
import { useState } from 'react'

export default function CopyLink({ path }: { path: string }) {
  const [done, setDone] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(location.origin + path); setDone(true); setTimeout(() => setDone(false), 2000) } catch {}
  }
  return <button className="btn !px-3 !py-1.5 text-sm" onClick={copy}>{done ? 'Copied ✓' : 'Copy link'}</button>
}
