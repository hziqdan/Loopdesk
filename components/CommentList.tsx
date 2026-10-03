'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type C = { id: string; authorName: string; body: string; x: number | null; y: number | null; resolved: boolean }

export default function CommentList({ comments, imageUrl }: { comments: C[]; imageUrl?: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const pins = comments.filter((c) => c.x != null && c.y != null)
  const num = (id: string) => pins.findIndex((c) => c.id === id) + 1

  async function toggle(c: C) {
    setBusy(c.id)
    await fetch(`/api/comments/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resolved: !c.resolved }) })
    setBusy(null)
    router.refresh()
  }
  if (!comments.length) return <div className="card mt-4 text-center"><p className="text-mute">No feedback yet. Send your review link to a client.</p></div>
  return (
    <>
      {imageUrl && pins.length > 0 && (
        <div className="mt-4">
          <div className="relative overflow-hidden rounded-xl border border-line" onClick={() => setActive(null)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Latest version with client pins" className="block w-full select-none" draggable={false} />
            {pins.map((c) => (
              <button key={c.id} aria-label={`Comment ${num(c.id)} by ${c.authorName}`} style={{ left: `${c.x}%`, top: `${c.y}%` }}
                onClick={(e) => { e.stopPropagation(); setActive(c.id) }}
                className={`absolute h-[30px] w-[30px] -translate-x-1/2 -translate-y-full rounded-[50%_50%_50%_4px] border-2 border-white text-[13px] font-bold text-white shadow ${c.resolved ? 'bg-ok' : 'bg-brand'} ${active === c.id ? 'ring-4 ring-amber-300' : ''}`}>{num(c.id)}</button>
            ))}
          </div>
          <p className="mt-2 text-sm text-mute">Blue pins are open, green pins are resolved. Click a pin or a comment to match them up.</p>
        </div>
      )}
      <ul className="mt-4 grid gap-3">
        {comments.map((c) => (
          <li key={c.id} onClick={() => setActive(c.id)} className={`card flex cursor-pointer items-start gap-3 !p-4 ${active === c.id ? '!border-amber-400' : ''}`}>
            {c.x != null
              ? <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${c.resolved ? 'bg-ok' : 'bg-brand'}`}>{num(c.id)}</span>
              : <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-line text-xs text-mute">•</span>}
            <div className="flex-1"><b className="text-sm">{c.authorName}</b><p className={`whitespace-pre-wrap break-words ${c.resolved ? 'text-mute line-through' : ''}`}>{c.body}</p></div>
            <button className="btn !px-3 !py-1.5 text-sm disabled:opacity-60" disabled={busy === c.id} onClick={(e) => { e.stopPropagation(); toggle(c) }}>{c.resolved ? 'Reopen' : 'Resolve'}</button>
          </li>
        ))}
      </ul>
    </>
  )
}
