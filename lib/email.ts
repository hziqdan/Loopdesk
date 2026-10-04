// Sends email through Resend's HTTP API (no extra package needed).
// Email must never break the main action, so every failure is logged and swallowed.
const APP_URL = () => process.env.APP_URL ?? 'http://localhost:3000'

// Comment text comes from strangers, so escape it before putting it in HTML
export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const projectUrl = (projectId: string) => `${APP_URL()}/dashboard/${projectId}`

export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) return console.warn('RESEND_API_KEY not set, skipping email:', subject)
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM ?? 'Loopdesk <onboarding@resend.dev>', to, subject, html }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) console.error('Resend rejected the email:', res.status, await res.text())
  } catch (e) {
    console.error('Email failed:', e)
  }
}

const wrap = (body: string, link: string, cta: string) =>
  `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;color:#111827">${body}
   <p style="margin:24px 0"><a href="${link}" style="background:#4F46E5;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">${cta}</a></p>
   <p style="color:#6B7280;font-size:13px">Loopdesk demo project</p></div>`

export function commentEmail(project: string, id: string, items: { authorName: string; body: string }[]) {
  const list = items.map((c) => `<p style="margin:12px 0;padding:12px;background:#F3F4F6;border-radius:8px"><b>${esc(c.authorName)}</b><br>${esc(c.body)}</p>`).join('')
  return {
    subject: `New feedback on ${project}`,
    html: wrap(`<h2>New feedback on ${esc(project)}</h2>${list}`, projectUrl(id), 'View feedback'),
  }
}

export function approvalEmail(project: string, id: string, version: number, name: string, email: string) {
  return {
    subject: `${project} was approved`,
    html: wrap(`<h2>${esc(project)} was approved ✓</h2><p>Version ${version} was approved by <b>${esc(name)}</b> (${esc(email)}).</p>`, projectUrl(id), 'Open project'),
  }
}
