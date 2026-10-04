import type { Metadata } from 'next'
import Form from '@/components/Form'
import { PageHero } from '@/components/ui'
export const metadata: Metadata = { title: 'Contact' }

export default function Contact() {
  return (
    <>
      <PageHero title="Questions? We reply within one business day." sub="Tell us what you're working on and we'll point you in the right direction." />
      <section className="px-6 pb-24 text-center">
        <Form endpoint="/api/contact" button="Send message" ok="Message sent. We'll reply within one business day." err="Enter a valid email address."
          fields={[{ name: 'name', label: 'Name' }, { name: 'email', label: 'Email', type: 'email' }, { name: 'message', label: 'How can we help?', area: true }]} />
        <p className="mt-2 text-sm text-mute">Prefer email? hello@loopdesk.example · We never share your details.</p></section>
    </>
  )
}
