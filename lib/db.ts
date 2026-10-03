import { PrismaClient } from '@prisma/client'

// Reuse one client in dev so hot reloads don't open new connections
const g = globalThis as unknown as { prisma?: PrismaClient }
export const db = g.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') g.prisma = db
