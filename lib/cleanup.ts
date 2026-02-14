import cron from 'node-cron'
import { db } from '@/lib/db/index'
import { webhooks, requests } from '@/lib/db/schema'
import { eq, and, isNull, lt, inArray } from 'drizzle-orm'

const RETENTION_DAYS = parseInt(process.env.ANONYMOUS_RETENTION_DAYS ?? '7', 10)
const SCHEDULE = process.env.CLEANUP_SCHEDULE ?? '0 0 * * *'

export async function runCleanup() {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS)

  try {
    const anonWebhooks = await db.select({ id: webhooks.id }).from(webhooks).where(
      and(isNull(webhooks.ownerId), isNull(webhooks.deletedAt))
    )
    const anonIds = anonWebhooks.map((w) => w.id)

    if (anonIds.length === 0) {
      console.log('[cleanup] No anonymous webhooks found, nothing to clean up.')
      return
    }

    const result = await db.delete(requests).where(
      and(
        inArray(requests.webhookId, anonIds),
        lt(requests.timestamp, cutoff),
        isNull(requests.deletedAt)
      )
    )

    console.log(`[cleanup] Soft-deleted requests older than ${RETENTION_DAYS} days for anonymous webhooks.`)
  } catch (err) {
    console.error('[cleanup] Error during cleanup job:', err)
  }
}

export function startCleanupJob() {
  if (!cron.validate(SCHEDULE)) {
    console.error(`[cleanup] Invalid cron schedule: "${SCHEDULE}". Cleanup job not started.`)
    return
  }

  cron.schedule(SCHEDULE, async () => {
    console.log('[cleanup] Running scheduled cleanup...')
    await runCleanup()
  })

  console.log(`[cleanup] Cleanup job scheduled: ${SCHEDULE}`)
}
