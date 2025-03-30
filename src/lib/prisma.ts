import { PrismaClient } from '@prisma/client'
import path from 'path'

// Define global type for PrismaClient
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Use absolute path for database
const dbPath = path.resolve(process.cwd(), 'prisma/dev.db')
const url = `file:${dbPath}`

// Create a singleton instance of the Prisma client
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
    datasources: {
      db: {
        url,
      },
    },
  })

// Save the instance to the global object in non-production environments
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma 