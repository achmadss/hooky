import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAnonymousSessionId } from '@/lib/session'

// Task 2.9 / 21.8: Check authenticated vs anonymous state (server-side)
export async function getAuthState() {
  const session = await getServerSession(authOptions)

  if (session?.user?.id) {
    return { isAuthenticated: true, isAnonymous: false, userId: session.user.id }
  }

  const anonSessionId = await getAnonymousSessionId()
  return {
    isAuthenticated: false,
    isAnonymous: true,
    userId: null,
    anonSessionId,
  }
}
