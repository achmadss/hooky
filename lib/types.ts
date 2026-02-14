import { InferSelectModel } from 'drizzle-orm'
import { requests, webhooks, users, responseConfigs } from './db/schema'

export type Request = InferSelectModel<typeof requests>
export type Webhook = InferSelectModel<typeof webhooks>
export type User = InferSelectModel<typeof users>
export type ResponseConfig = InferSelectModel<typeof responseConfigs>
