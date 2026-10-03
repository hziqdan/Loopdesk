'use client'
import { FormEvent, MouseEvent, useEffect, useState } from 'react'
import type { ReviewData } from '@/lib/review'

type Data = NonNullable<ReviewData>
type Version = NonNullable<Data['version']>
type Comment = Version['comments'][number]
const post = (body: unknown) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
const field = 'w-full rounded-[10px] border border-line bg-card px-3.5 py-2.5'
const when = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export default function ReviewClient({ token, data }: { token: string; data: Data }) {
  const v = data.version as Version
  const [comments, setComments] = useState<Comment[]>(v.comments)
  const [approval, setApproval] = useState(v.approval)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null)
  const [text, setText] = useState('')
  const [active, setActive] = useState<string | null>(null)
  const [asking, setAsking] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { try { setName(localStorage.getItem('ld_name') ?? '') } catch {} }, [])

  const pinned = comments.filter((c) => c.x != null && c.y != null)
  const num = (id: string) => pinned.findIndex((c) => c.id === id) + 1

  async function send(body: string, pin: { x: number; y: number } | null) {
    if (!name.trim()) return setErr('Enter your name first.')
    setBusy(true); setErr('')
    const res = await fetch(`/api/review/${token}/comments`, post({ authorName: name, body, x: pin?.x ?? null, y: pin?.y ?? null }))
    const j = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setErr(j.error ?? 'Something went wrong.')
    setComments((c) => [...c, j.comment]); setDraft(null); setText('')
    try { localStorage.setItem('ld_name', name) } catch {}
  }
  function place(e: MouseEvent<HTMLDivElement>) {
    if (approval) return
    const r = e.currentTarget.getBoundingClientRect() // percentages keep pins in place on any screen size
    setDraft({ x: +(((e.clientX - r.left) / r.width) * 100).toFixed(2), y: +(((e.clientY - r.top) / r.height) * 100).toFixed(2) })
    setActive(null); setErr('')
  }
  async function approve(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setErr('')
    const res = await fetch(`/api/review/${token}/approve`, post({ name, email }))
    const j = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setErr(j.error ?? 'Something went wrong.')
    setApproval(j.approval); setAsking(false)
    try { localStorage.setItem('ld_name', name) } catch {}
  }

  return (
    <section className="py-10 md:py-14"><div className="wrap max-w-[1000px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="!text-3xl">{data.name}</h1><p className="mt-1 text-sm text-mute">Version {v.number} · Leave feedback below. No account needed.</p></div>
        {approval
          ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">Approved ✓</span>
          : <button className="btn btn-p" onClick={() => { setAsking(!asking); setErr('') }}>Approve this version</button>}
      </div>

      {approval && <p className="mt-4 rounded-xl border border-line bg-card p-4 text-sm">Approved by <b>{approval.approverName}</b> on <span suppressHydrationWarning>{when(approval.createdAt)}</span>. This version is now closed for comments.</p>}
      {asking && !approval && (
        <form onSubmit={approve} className="card mt-4 grid gap-3 !p-5 sm:grid-cols-[1fr_1fr_auto]">
          <input className={field} placeholder="Your name" aria-label="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={field} placeholder="Your email" aria-label="Your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn btn-p disabled:opacity-60" disabled={busy}>{busy ? 'Saving…' : 'Confirm approval'}</button>
        </form>
      )}
      <p role="status" className="mt-2 min-h-[1.4em] text-sm text-red-600">{err}</p>

      <div className="mt-4 grid gap-6 md:grid-cols-[1.6fr_1fr]">
        <div>
          {v.fileType === 'image' && (
            <>
              <div className="relative cursor-crosshair overflow-hidden rounded-xl border border-line" onClick={place}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.fileUrl} alt={`${data.name}, version ${v.number}`} className="block w-full select-none" draggable={false} />
                {pinned.map((c) => (
                  <button key={c.id} aria-label={`Comment ${num(c.id)}`} style={{ left: `${c.x}%`, top: `${c.y}%` }}
                    onClick={(e) => { e.stopPropagation(); setActive(c.id); setDraft(null) }}
                    className={`absolute h-[30px] w-[30px] -translate-x-1/2 -translate-y-full rounded-[50%_50%_50%_4px] border-2 border-white text-[13px] font-bold text-white shadow ${c.resolved ? 'bg-ok' : 'bg-brand'} ${active === c.id ? 'ring-4 ring-amber-300' : ''}`}>{num(c.id)}</button>
                ))}
                {draft && (
                  <div onClick={(e) => e.stopPropagation()} className="absolute z-10 w-60 rounded-xl border border-line bg-card p-3 shadow-lg"
                    style={{ left: `${Math.min(draft.x, 60)}%`, top: `calc(${draft.y}% + 8px)` }}>
                    <input className={`${field} mb-2 !py-1.5 text-sm`} placeholder="Your name" aria-label="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                    <textarea autoFocus rows={3} className={`${field} text-sm`} placeholder="Your comment" aria-label="Comment" value={text} onChange={(e) => setText(e.target.value)} />
                    <div className="mt-2 flex gap-2">
                      <button className="btn btn-p !px-3 !py-1.5 text-sm disabled:opacity-60" disabled={busy} onClick={() => send(text, draft)}>{busy ? 'Posting…' : 'Post'}</button>
                      <button className="btn !px-3 !py-1.5 text-sm" onClick={() => setDraft(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
              {!approval && <p className="mt-2 text-sm text-mute">Click anywhere on the image to drop a pin.</p>}
            </>
          )}
          {v.fileType === 'pdf' && <iframe src={v.fileUrl} title="Document" className="h-[70vh] w-full rounded-xl border border-line" />}
          {v.fileType === 'video' && <video src={v.fileUrl} controls className="w-full rounded-xl border border-line" />}
        </div>

        <aside>
          <h2 className="!text-xl">Comments ({comments.length})</h2>
          <ul className="mt-3 grid gap-2.5">
            {comments.length === 0 && <li className="text-sm text-mute">No comments yet.</li>}
            {comments.map((c) => (
              <li key={c.id} onClick={() => setActive(c.id)} className={`card cursor-pointer !p-3.5 text-sm ${active === c.id ? '!border-amber-400' : ''}`}>
                <div className="flex items-center gap-2">
                  {c.x != null && <span className={`grid h-5 w-5 place-items-center rounded-full text-xs font-bold text-white ${c.resolved ? 'bg-ok' : 'bg-brand'}`}>{num(c.id)}</span>}
                  <b>{c.authorName}</b><span className="text-mute" suppressHydrationWarning>{when(c.createdAt)}</span>
                  {c.resolved && <span className="ml-auto text-xs font-semibold text-ok">Resolved</span>}
                </div>
                <p className="mt-1.5 whitespace-pre-wrap break-words">{c.body}</p>
              </li>
            ))}
          </ul>
          {!approval && (
            <form className="mt-4 grid gap-2" onSubmit={(e) => { e.preventDefault(); send(text, null) }}>
              <input className={field} placeholder="Your name" aria-label="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              <textarea rows={3} className={field} placeholder="Add a general comment" aria-label="General comment" value={draft ? '' : text} disabled={!!draft} onChange={(e) => setText(e.target.value)} />
              <button className="btn disabled:opacity-60" disabled={busy || !!draft}>Post general comment</button>
            </form>
          )}
        </aside>
      </div>
    </div></section>
  )
}
