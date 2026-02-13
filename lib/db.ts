import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const softDeleteModels = ['User', 'Webhook', 'Request', 'ResponseConfig'] as const
type SoftDeleteModel = (typeof softDeleteModels)[number]

function isSoftDelete(model: string): model is SoftDeleteModel {
  return softDeleteModels.includes(model as SoftDeleteModel)
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  })

  // Base client used inside extension to redirect deletes to updates
  const base = new PrismaClient({ adapter })

  return base.$extends({
    query: {
      $allModels: {
        async findMany({ args, query, model }) {
          if (isSoftDelete(model)) {
            args.where = { deletedAt: null, ...args.where }
          }
          return query(args)
        },
        async findFirst({ args, query, model }) {
          if (isSoftDelete(model)) {
            args.where = { deletedAt: null, ...args.where }
          }
          return query(args)
        },
        async findUnique({ args, query, model }) {
          if (isSoftDelete(model)) {
            args.where = { ...args.where, deletedAt: null }
          }
          return query(args)
        },
        async count({ args, query, model }) {
          if (isSoftDelete(model)) {
            args.where = { deletedAt: null, ...args.where }
          }
          return query(args)
        },
        async update({ args, query, model }) {
          if (isSoftDelete(model)) {
            args.where = { deletedAt: null, ...args.where }
          }
          return query(args)
        },
        async updateMany({ args, query, model }) {
          if (isSoftDelete(model)) {
            args.where = { deletedAt: null, ...args.where }
          }
          return query(args)
        },
        async delete({ args, model }) {
          if (isSoftDelete(model)) {
            // Redirect to soft-delete via base client (avoids recursive extension)
            const table = model.charAt(0).toLowerCase() + model.slice(1)
            return (base as any)[table].update({
              where: args.where,
              data: { deletedAt: new Date() },
            })
          }
          // Hard-delete for non-soft-delete models (none in this app)
          const table = model.charAt(0).toLowerCase() + model.slice(1)
          return (base as any)[table].delete({ where: args.where })
        },
        async deleteMany({ args, model }) {
          if (isSoftDelete(model)) {
            const table = model.charAt(0).toLowerCase() + model.slice(1)
            return (base as any)[table].updateMany({
              where: { deletedAt: null, ...args.where },
              data: { deletedAt: new Date() },
            })
          }
          const table = model.charAt(0).toLowerCase() + model.slice(1)
          return (base as any)[table].deleteMany({ where: args.where })
        },
      },
    },
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof createPrismaClient>
}

const prisma = globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma

// Returns the data payload to soft-delete a record (use with prisma.model.update)
export function softDeleteData() {
  return { deletedAt: new Date() }
}
