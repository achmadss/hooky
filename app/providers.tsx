'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { ToastProvider } from '@/components/ToastContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // Task 14.2-14.5: ThemeProvider with system detection and localStorage persistence
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="hooky-theme">
      <SessionProvider>
        <WebSocketProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </WebSocketProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
