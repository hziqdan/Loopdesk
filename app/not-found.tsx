import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="sec"><div className="wrap">
      <h1 className="!text-3xl">Page not found</h1>
      <p className="lead">This page doesn&apos;t exist, or the link has changed. If you were given a review link, ask for a new one.</p>
      <div className="btns"><Link href="/" className="btn btn-p">Go to the homepage</Link><Link href="/pricing" className="btn">See pricing</Link></div>
    </div></section>
  )
}
