import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ReviewClient from '@/components/ReviewClient'
import { getReview } from '@/lib/review'
export const metadata: Metadata = { title: 'Review', robots: { index: false } } // review links stay out of search results

export default async function ReviewPage({ params }: { params: { token: string } }) {
  const data = await getReview(params.token)
  if (!data) notFound()
  if (!data.version)
    return <section className="sec"><div className="wrap"><h1 className="!text-3xl">{data.name}</h1><p className="lead">No file has been uploaded yet. Check back soon.</p></div></section>
  return <ReviewClient token={params.token} data={data} />
}
