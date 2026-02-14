import { pgTable, uuid, varchar, boolean, timestamp, text, jsonb, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
})

export const webhooks = pgTable('webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: varchar('token', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  visibility: varchar('visibility', { length: 20 }).default('private').notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: varchar('session_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
})

export const requests = pgTable('requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  webhookId: uuid('webhook_id').notNull().references(() => webhooks.id, { onDelete: 'cascade' }),
  webhookToken: varchar('webhook_token', { length: 255 }).notNull(),
  method: varchar('method', { length: 10 }).notNull(),
  headers: jsonb('headers').notNull(),
  queryParams: jsonb('query_params').notNull(),
  body: text('body'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  sourceIp: varchar('source_ip', { length: 45 }).notNull(),
  userAgent: text('user_agent'),
  deletedAt: timestamp('deleted_at'),
})

export const responseConfigs = pgTable('response_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  webhookId: uuid('webhook_id').unique().notNull().references(() => webhooks.id, { onDelete: 'cascade' }),
  statusCode: integer('status_code').default(200).notNull(),
  headers: jsonb('headers').default({}).notNull(),
  body: text('body'),
  contentType: varchar('content_type', { length: 100 }).default('application/json').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Webhook = typeof webhooks.$inferSelect
export type NewWebhook = typeof webhooks.$inferInsert
export type Request = typeof requests.$inferSelect
export type NewRequest = typeof requests.$inferInsert
export type ResponseConfig = typeof responseConfigs.$inferSelect
export type NewResponseConfig = typeof responseConfigs.$inferInsert
