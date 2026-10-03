'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type C = { id: string; authorName: string; body: string; x: number | null; resolved: boolean }

export default function CommentList({ comments }: { comments: C[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const pins = comments.filter((c) => c.x != null)

  async function toggle(c: C) {
    setBusy(c.id)
    await fetch(`/api/comments/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resolved: !c.resolved }) })
    setBusy(null)
    router.refresh()
  }
  if (!comments.length) return <div className="card mt-4 text-center"><p className="text-mute">No feedback yet. Send your review link to a client.</p></div>
  return (
    <ul className="mt-4 grid gap-3">
      {comments.map((c) => (
        <li key={c.id} className="card flex items-start gap-3 !p-4">
          {c.x != null
            ? <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${c.resolved ? 'bg-ok' : 'bg-brand'}`}>{pins.indexOf(c) + 1}</span>
            : <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-line text-xs text-mute">•</span>}
          <div className="flex-1"><b className="text-sm">{c.authorName}</b><p className={`whitespace-pre-wrap break-words ${c.resolved ? 'text-mute line-through' : ''}`}>{c.body}</p></div>
          <button className="btn !px-3 !py-1.5 text-sm disabled:opacity-60" disabled={busy === c.id} onClick={() => toggle(c)}>{c.resolved ? 'Reopen' : 'Resolve'}</button>
        </li>
      ))}
    </ul>
  )
}
