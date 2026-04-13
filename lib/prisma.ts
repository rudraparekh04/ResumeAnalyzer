// lib/prisma.ts
// import { PrismaClient } from '@prisma/client'

// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
//   })

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
import { PrismaClient } from "@prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"

const globalForPrisma = globalThis as any

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient().$extends(withAccelerate())

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}