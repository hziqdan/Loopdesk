'use client'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function NewProjectForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setBusy(true); setError('')
    const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: new FormData(form).get('name') }) })
    const body = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setError(body.error ?? 'Something went wrong.')
    form.reset()
    router.push(`/dashboard/${body.project.id}`)
  }
  return (
    <form onSubmit={submit} className="mt-8">
      <div className="flex flex-wrap gap-3">
        <input name="name" placeholder="New project name" aria-label="Project name" className="min-w-[220px] flex-1 rounded-[10px] border border-line bg-card px-3.5 py-3" />
        <button className="btn btn-p disabled:opacity-60" disabled={busy}>{busy ? 'Creating…' : 'Create project'}</button>
      </div>
      <p role="status" className="mt-2 min-h-[1.4em] text-sm text-red-600">{error}</p>
    </form>
  )
}
