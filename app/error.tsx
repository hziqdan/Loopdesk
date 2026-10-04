'use client'
import Link from 'next/link'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="sec"><div className="wrap">
      <h1 className="!text-3xl">This page could not load</h1>
      <p className="lead">Something failed on our side. Try again, and if it keeps happening, send us a message.</p>
      <div className="btns"><button className="btn btn-p" onClick={reset}>Try again</button><Link href="/contact" className="btn">Contact us</Link></div>
    </div></section>
  )
}
