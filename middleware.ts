import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ANON_SESSION_COOKIE } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Authenticated management routes require a valid NextAuth session
  const managementRoutes = ['/dashboard']
  if (managementRoutes.some((r) => pathname.startsWith(r))) {
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Webhook detail pages: anonymous users must have a matching session cookie
  // Full ownership check happens in the page itself; middleware only gate-keeps the cookie
  if (pathname.startsWith('/webhooks/')) {
    const token = await getToken({ req: request })
    const anonSession = request.cookies.get(ANON_SESSION_COOKIE)
    if (!token && !anonSession) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/webhooks/:path*'],
}
