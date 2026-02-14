'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Shield, Globe, CheckCircle } from 'lucide-react'

export default function Homepage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleTryNow = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/init', { method: 'POST' })
      const data = await res.json()
      if (data.webhook?.id) {
        router.push(`/webhooks/${data.webhook.id}`)
      }
    } catch (error) {
      console.error('Failed to create webhook:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <main className="py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">
              Webhook debugging made{' '}
              <span className="text-blue-600">simple</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Capture, inspect, and debug HTTP webhooks instantly. 
              No setup required - just create a webhook and start receiving requests.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {status === 'authenticated' ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-lg transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  onClick={handleTryNow}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Try Now'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Instant Setup
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create a webhook URL in seconds. No registration required to start capturing requests.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Inspect Everything
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                View headers, body, query parameters, and more. Debug your webhooks with full context.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Custom Responses
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Configure custom response status codes, headers, and body for your webhooks.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-24">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
              How it works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Create a webhook', desc: 'Get a unique URL instantly' },
                { step: '2', title: 'Send requests', desc: 'Point your webhook to our URL' },
                { step: '3', title: 'Inspect & debug', desc: 'View all incoming requests' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-24 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Ready to start debugging your webhooks?
            </p>
            {status === 'authenticated' ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <button
                onClick={handleTryNow}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Try Now'}
              </button>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-200 dark:border-zinc-800">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            Built for developers who need quick webhook debugging
          </p>
        </footer>
      </div>
    </div>
  )
}
