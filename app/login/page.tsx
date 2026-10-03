import type { Metadata } from 'next'
import Link from 'next/link'
import Form from '@/components/Form'
import { PageHero } from '@/components/ui'
export const metadata: Metadata = { title: 'Log in' }

export default function Login() {
  return (
    <>
      <PageHero title="Welcome back." sub="Log in to see your projects and feedback." />
      <section className="px-6 pb-24 text-center">
        <Form endpoint="/api/auth/login" redirect="/dashboard" button="Log in" ok="Logged in. Redirecting…" err="Enter a valid email address."
          fields={[{ name: 'email', label: 'Email', type: 'email' }, { name: 'password', label: 'Password', type: 'password' }]} />
        <p className="mt-2 text-sm text-mute">New here? <Link href="/signup" className="text-brand underline">Create a free account</Link></p></section>
    </>
  )
}
