import type { Metadata } from 'next'
import Link from 'next/link'
import Form from '@/components/Form'
import { PageHero } from '@/components/ui'
export const metadata: Metadata = { title: 'Sign up' }

export default function Signup() {
  return (
    <>
      <PageHero title="Start your first review in two minutes." sub="Free for 2 projects. No credit card required." />
      <section className="px-6 pb-24 text-center">
        <Form endpoint="/api/auth/signup" redirect="/dashboard" button="Create free account" ok="You're in. Let's get your first approval." err="Enter a valid email address."
          fields={[{ name: 'name', label: 'Name' }, { name: 'email', label: 'Email', type: 'email' }, { name: 'password', label: 'Password', type: 'password' }]} />
        <p className="mt-2 text-sm text-mute">Already have an account? <Link href="/login" className="text-brand underline">Log in</Link><br />By signing up, you agree to the Terms and Privacy Policy.</p></section>
    </>
  )
}
