import Link from 'next/link'
const col = (title: string, links: string[][]) => (
  <div><h4 className="mb-2 font-semibold text-gray-100">{title}</h4>
    {links.map(([h, t]) => <Link key={h} href={h} className="block py-0.5 hover:text-white">{t}</Link>)}</div>
)
export default function Footer() {
  return (
    <footer className="bg-navy py-14 text-[15px] text-slate-400">
      <div className="wrap">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2"><b className="text-xl text-white">Loopdesk</b>
            <p className="mt-2 max-w-xs">Client feedback and approval, without the email chaos.</p></div>
          {col('Product', [['/features', 'Features'], ['/pricing', 'Pricing'], ['/case-studies', 'Case studies']])}
          {col('Company', [['/about', 'About'], ['/contact', 'Contact']])}
        </div>
        <p className="mt-9 border-t border-slate-800 pt-5 text-[13px]">© 2026 Loopdesk · Demo project built by [Your Name]. All customers, reviews and quotes are sample content.</p>
      </div>
    </footer>
  )
}
