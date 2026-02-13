import cron from 'node-cron'
import prisma from '@/lib/db'

// Task 8.6: Retention period in days (configurable via env)
const RETENTION_DAYS = parseInt(process.env.ANONYMOUS_RETENTION_DAYS ?? '7', 10)

// Task 8.5: Schedule — default daily at midnight UTC
const SCHEDULE = process.env.CLEANUP_SCHEDULE ?? '0 0 * * *'

// Task 8.2 / 8.3 / 8.9: Soft-delete requests older than RETENTION_DAYS for anonymous webhooks
export async function runCleanup() {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS)

  try {
    // Find anonymous webhook IDs
    const anonWebhooks = await prisma.webhook.findMany({
      where: { ownerId: null },
      select: { id: true },
    })
    const anonIds = anonWebhooks.map((w) => w.id)

    if (anonIds.length === 0) {
      console.log('[cleanup] No anonymous webhooks found, nothing to clean up.')
      return
    }

    // Task 8.2: Soft-delete old requests for anonymous webhooks
    const result = await prisma.request.deleteMany({
      where: {
        webhookId: { in: anonIds },
        timestamp: { lt: cutoff },
      },
    })

    // Task 8.4: Log cleanup activity
    console.log(`[cleanup] Soft-deleted ${result.count} requests older than ${RETENTION_DAYS} days for anonymous webhooks.`)
  } catch (err) {
    // Task 8.8: Error handling
    console.error('[cleanup] Error during cleanup job:', err)
  }
}

// Task 8.1 / 8.5: Register the scheduled job
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
