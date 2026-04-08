// app/api/rewrite/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { callGroq, parseJsonResponse } from '@/lib/groq'
import { buildBulletRewritePrompt, BULLET_REWRITE_SYSTEM } from '@/lib/prompts'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import type { BulletRewriteResult } from '@/types'

const schema = z.object({
  bullets: z.array(z.string().min(5).max(500)).min(1).max(10),
  analysisId: z.string().optional(),
})
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
  limiter.check(req, 10, `analyze:${session.user.id}`)
} catch {
  return NextResponse.json(
    { error: 'Analysis limit reached (10/hour). Please wait.' },
    { status: 429 }
  )
}
    const { bullets, analysisId } = schema.parse(await req.json())

    const raw = await callGroq(BULLET_REWRITE_SYSTEM, buildBulletRewritePrompt(bullets), 2000)
    const results = parseJsonResponse<BulletRewriteResult[]>(raw)

    // Save if linked to analysis
    if (analysisId) {
      const analysis = await prisma.analysis.findFirst({
        where: { id: analysisId, resume: { userId: session.user.id } },
      })
      if (analysis) {
        await prisma.bulletRewrite.createMany({
          data: results.map((r) => ({
            analysisId,
            original: r.original ?? '',
            rewritten: r.rewritten ?? '',
            improvement: r.improvement,
          })),
          skipDuplicates: true,
        })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (e: any) {
    console.error('[REWRITE]', e)
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0]?.message ?? 'Validation error' }, { status: 400 })
    }
    return NextResponse.json({ error: e.message ?? 'Rewrite failed' }, { status: 500 })
  }
}
