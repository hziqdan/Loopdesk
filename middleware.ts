import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

// Runs before /dashboard pages: no valid session cookie means redirect to /login
export async function middleware(req: NextRequest) {
  const token = req.cookies.get('ld_session')?.value
  try {
    if (!token) throw new Error('no token')
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}
export const config = { matcher: ['/dashboard/:path*'] }
