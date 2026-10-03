import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: { default: 'Loopdesk: client approval in hours, not weeks', template: '%s | Loopdesk' },
  description: 'Clients comment directly on your designs, videos and documents, then approve with one click.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>
      <a href="#main" className="absolute -left-[999px] focus:left-2 focus:top-2 focus:z-50 focus:bg-white focus:p-2">Skip to content</a>
      <Header /><main id="main">{children}</main><Footer />
    </body></html>
  )
}
