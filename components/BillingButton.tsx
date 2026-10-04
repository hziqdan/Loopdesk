'use client'
import { useState } from 'react'

export default function BillingButton() {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  async function open() {
    setBusy(true); setErr('')
    const res = await fetch('/api/billing/portal', { method: 'POST' })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) { setBusy(false); return setErr(j.error ?? 'Something went wrong.') }
    window.location.href = j.url
  }
  return (
    <span>
      <button className="btn disabled:opacity-60" onClick={open} disabled={busy}>{busy ? 'Opening…' : 'Manage billing'}</button>
      {err && <span role="status" className="ml-2 text-sm text-red-600">{err}</span>}
    </span>
  )
}
