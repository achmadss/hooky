// Section 9 tasks will flesh this out with the full management UI.
// Placeholder to satisfy the homepage import.
import type { Webhook } from '@prisma/client'

type WebhookWithCount = Webhook & { _count: { requests: number } }

export default function Dashboard({ webhooks }: { webhooks: WebhookWithCount[] }) {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">My Webhooks</h1>
      {webhooks.length === 0 ? (
        <p className="text-zinc-500">No webhooks yet.</p>
      ) : (
        <ul className="space-y-2">
          {webhooks.map((wh) => (
            <li key={wh.id}>
              <a href={`/webhooks/${wh.id}`} className="underline">
                {wh.token}
              </a>{' '}
              — {wh._count.requests} requests
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
