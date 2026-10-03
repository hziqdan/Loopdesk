'use client'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useState } from 'react'

const json = (body: unknown) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

export default function UploadVersion({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target
    const file = input.files?.[0]
    if (!file) return
    setBusy(true); setMsg('Checking…')
    try {
      // 1. Ask our server for permission (type, size and plan limits are checked there)
      const s = await fetch(`/api/projects/${projectId}/versions/sign`, json({ fileName: file.name, fileType: file.type, fileSize: file.size }))
      const sign = await s.json()
      if (!s.ok) throw new Error(sign.error)

      // 2. Upload straight to storage with the one-time token (the file never passes through our server)
      setMsg('Uploading…')
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { error } = await sb.storage.from('uploads').uploadToSignedUrl(sign.path, sign.token, file, { contentType: file.type })
      if (error) throw new Error('Upload failed. Please try again.')

      // 3. Tell our server to record the new version
      const r = await fetch(`/api/projects/${projectId}/versions`, json({ path: sign.path, fileType: file.type }))
      const rec = await r.json()
      if (!r.ok) throw new Error(rec.error)
      setMsg('')
      router.refresh()
    } catch (err: any) {
      setMsg(err.message ?? 'Something went wrong.')
    } finally {
      setBusy(false)
      input.value = ''
    }
  }
  return (
    <div>
      <label className={`btn btn-p inline-block ${busy ? 'pointer-events-none opacity-60' : ''}`}>
        {busy ? 'Working…' : 'Upload new version'}
        <input type="file" className="sr-only" accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,video/mp4,video/quicktime" onChange={onPick} disabled={busy} />
      </label>
      <p role="status" className="mt-2 min-h-[1.4em] text-sm text-mute">{msg}</p>
    </div>
  )
}
