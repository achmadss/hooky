import { isNull, SQL } from 'drizzle-orm'
import { db } from './index'
import * as schema from './schema'

export const softDeleteData = {
  deletedAt: new Date(),
}

export function whereNotDeleted(): SQL {
  return isNull(schema.users.deletedAt) as unknown as SQL
}

export async function softDelete(
  table: typeof schema.users | typeof schema.webhooks | typeof schema.requests | typeof schema.responseConfigs,
  id: string
): Promise<void> {
  await db.update(table)
    .set({ deletedAt: new Date() })
    .where(isNull(table.deletedAt))
}

export const withDeleted = { deletedAt: null }
