// app/api/job-match/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { callGroq, parseJsonResponse } from '@/lib/groq'
import { buildJobMatchPrompt, JOB_MATCH_SYSTEM } from '@/lib/prompts'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import type { JobMatchResult } from '@/types'

const schema = z.object({
  resumeId: z.string().min(1),
  jobTitle: z.string().min(1).max(200).trim(),
  jobDescription: z.string().min(50).max(10000).trim(),
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
    const { resumeId, jobTitle, jobDescription } = schema.parse(await req.json())

    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId: session.user.id } })
    if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 })

    const raw = await callGroq(JOB_MATCH_SYSTEM, buildJobMatchPrompt(resume.parsedText, jobDescription), 1500)
    const result = parseJsonResponse<JobMatchResult>(raw)
    result.matchScore = Math.max(0, Math.min(100, Math.round(result.matchScore ?? 0)))

    const jobMatch = await prisma.jobMatch.create({
      data: {
        userId: session.user.id,
        resumeId,
        jobTitle,
        jobDescription,
        matchScore: result.matchScore,
        missingSkills: result.missingSkills ?? [],
        presentSkills: result.presentSkills ?? [],
        suggestions: result.suggestions ?? [],
        keywordsToAdd: result.keywordsToAdd ?? [],
        analysis: result.analysis ?? '',
      },
    })

    return NextResponse.json({ success: true, jobMatchId: jobMatch.id, result })
  } catch (e: any) {
    console.error('[JOB-MATCH]', e)
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0]?.message ?? 'Validation error' }, { status: 400 })
    }
    return NextResponse.json({ error: e.message ?? 'Job matching failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const matches = await prisma.jobMatch.findMany({
      where: { userId: session.user.id },
      include: { resume: { select: { originalName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    return NextResponse.json(matches)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
