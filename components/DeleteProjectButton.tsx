'use client'
import { useRouter } from 'next/navigation'

export default function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter()
  async function del() {
    if (!confirm('Delete this project and all its files? This cannot be undone.')) return
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (res.ok) { router.push('/dashboard'); router.refresh() }
  }
  return <button onClick={del} className="btn !text-red-600">Delete project</button>
}
