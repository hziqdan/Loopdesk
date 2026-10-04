import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { esc, sendEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'

const fail = (error: string, code: string, status: number) => NextResponse.json({ error, code }, { status })
const schema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  message: z.string().trim().min(5, 'Tell us a bit more about how we can help.').max(2000),
  website: z.string().optional(), // honeypot: hidden from people, filled in by bots
})

export async function POST(req: Request) {
  const limited = await rateLimit(req, 'contact', 3, 60 * 60 * 1000) // 3 messages per hour per visitor
  if (limited) return limited

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail(parsed.error.issues[0].message, 'VALIDATION', 400)
  const { name, email, message, website } = parsed.data

  if (website) return NextResponse.json({ ok: true }, { status: 201 }) // a bot: pretend it worked, save nothing

  try {
    await db.contactMessage.create({ data: { name, email, message } })
  } catch (e) {
    console.error('Saving contact message failed:', e)
    return fail("Couldn't send your message. Please try again.", 'SERVER', 500)
  }

  const to = process.env.CONTACT_TO_EMAIL
  if (to) {
    await sendEmail(
      to,
      `New message from ${name.replace(/[\r\n]+/g, ' ')}`,
      `<p><b>${esc(name)}</b> (${esc(email)})</p><p style="white-space:pre-wrap">${esc(message)}</p>`,
    )
  }
  return NextResponse.json({ ok: true }, { status: 201 })
}
