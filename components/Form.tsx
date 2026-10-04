'use client'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
type Field = { name: string; label: string; type?: string; area?: boolean }
const input = 'w-full rounded-[10px] border border-line bg-card px-3.5 py-3 font-normal'

type Props = { fields: Field[]; button: string; ok: string; err: string; endpoint?: string; redirect?: string }

export default function Form({ fields, button, ok, err, endpoint, redirect }: Props) {
  const router = useRouter()
  const [msg, setMsg] = useState<{ text: string; good: boolean } | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    if (!/^\S+@\S+\.\S+$/.test((data.email ?? '').trim())) return setMsg({ text: err, good: false })
    if (data.password !== undefined && endpoint?.includes('signup') && data.password.length < 8)
      return setMsg({ text: 'Password needs at least 8 characters.', good: false })

    if (endpoint) {
      setBusy(true)
      try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) return setMsg({ text: body.error ?? err, good: false }) // shows the server's reason, e.g. "Too many attempts. Try again in 12 minutes."
        setMsg({ text: ok, good: true })
        if (redirect) { router.push(redirect); router.refresh() } else form.reset()
      } catch {
        setMsg({ text: 'Network error. Check your connection and try again.', good: false })
      } finally {
        setBusy(false)
      }
      return
    }
    setMsg({ text: ok, good: true }) // no endpoint: client-side only
    form.reset()
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto mt-9 grid max-w-[480px] gap-4 text-left">
      {fields.map((f) => (
        <label key={f.name} className="grid gap-1.5 text-sm font-semibold">{f.label}
          {f.area ? <textarea name={f.name} rows={5} className={input} /> : <input name={f.name} type={f.type ?? 'text'} autoComplete={f.type === 'password' ? (endpoint?.includes('signup') ? 'new-password' : 'current-password') : f.name} className={input} />}
        </label>
      ))}
      {/* Honeypot: people never see or fill this, bots usually do, and the server drops those submissions */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <button className="btn btn-p disabled:opacity-60" type="submit" disabled={busy}>{busy ? 'Please wait…' : button}</button>
      <p role="status" className={`min-h-[1.4em] text-sm ${msg?.good ? 'text-ok' : 'text-red-600'}`}>{msg?.text}</p>
    </form>
  )
}
