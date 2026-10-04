import { describe, expect, it } from 'vitest'
import { approvalEmail, commentEmail, esc } from '@/lib/email'

describe('email content from strangers is escaped', () => {
  it('escapes HTML characters', () => {
    expect(esc('<b>"hi" & bye</b>')).toBe('&lt;b&gt;&quot;hi&quot; &amp; bye&lt;/b&gt;')
  })
  it('a malicious comment cannot inject a script into the notification', () => {
    const { html } = commentEmail('Logo', 'p1', [{ authorName: '<img src=x onerror=alert(1)>', body: '<script>alert(1)</script>' }])
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;script&gt;')
  })
  it('an approval email names the approver safely and links to the project', () => {
    const { subject, html } = approvalEmail('Logo', 'p1', 2, '<b>Sam</b>', 'sam@example.com')
    expect(subject).toBe('Logo was approved')
    expect(html).toContain('&lt;b&gt;Sam&lt;/b&gt;')
    expect(html).toContain('/dashboard/p1')
  })
})
