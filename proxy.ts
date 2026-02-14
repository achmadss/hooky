import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db/index'
import { webhooks } from '@/lib/db/schema'
import { eq, isNull, and } from 'drizzle-orm'
import { ANON_SESSION_COOKIE } from '@/lib/session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Authenticated management routes require a valid NextAuth session
  const managementRoutes = ['/dashboard']
  if (managementRoutes.some((r) => pathname.startsWith(r))) {
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Webhook detail pages: check if webhook is public or user has session
  if (pathname.startsWith('/webhooks/')) {
    const token = await getToken({ req: request })
    const anonSession = request.cookies.get(ANON_SESSION_COOKIE)
    
    // If authenticated or has anon session, allow through
    if (token || anonSession) {
      return NextResponse.next()
    }
    
    // For unauthenticated users without session, check if webhook is public
    const webhookId = pathname.split('/webhooks/')[1]?.split('/')[0]
    if (webhookId) {
      const webhookResult = await db.select().from(webhooks).where(
        and(eq(webhooks.id, webhookId), eq(webhooks.visibility, 'public'), isNull(webhooks.deletedAt))
      ).limit(1)
      
      if (webhookResult[0]) {
        return NextResponse.next()
      }
    }
    
    // Redirect to home for private webhooks without session
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/webhooks/:path*'],
}
