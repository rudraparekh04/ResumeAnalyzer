// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { callGroq, parseJsonResponse } from '@/lib/groq'
import { buildAnalysisPrompt, RESUME_ANALYSIS_SYSTEM } from '@/lib/prompts'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import type { AnalysisResult } from '@/types'


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

    const { resumeId } = z.object({ resumeId: z.string().min(1) }).parse(await req.json())

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: session.user.id },
    })
    if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    if (resume.parsedText.length < 50) {
      return NextResponse.json({ error: 'Resume text too short to analyze' }, { status: 400 })
    }

    const raw = await callGroq(RESUME_ANALYSIS_SYSTEM, buildAnalysisPrompt(resume.parsedText), 2048)
    const result = parseJsonResponse<AnalysisResult>(raw)

    // Normalize
    result.atsScore = Math.max(0, Math.min(100, Math.round(result.atsScore ?? 50)))
    result.strengths = result.strengths?.slice(0, 6) ?? []
    result.weaknesses = result.weaknesses?.slice(0, 6) ?? []
    result.missingKeywords = result.missingKeywords?.slice(0, 10) ?? []
    result.improvements = result.improvements?.slice(0, 6) ?? []
    result.careerTips = result.careerTips?.slice(0, 3) ?? []

    const analysis = await prisma.analysis.create({
      data: {
        resumeId,
        atsScore: result.atsScore,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        missingKeywords: result.missingKeywords,
        improvements: result.improvements,
        sectionFeedback: result.sectionFeedback ?? {},
        careerTips: result.careerTips,
        rawResponse: raw,
      },
    })

    return NextResponse.json({ success: true, analysisId: analysis.id, result })
  } catch (e: any) {
    console.error('[ANALYZE]', e)
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    return NextResponse.json({ error: e.message ?? 'Analysis failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = new URL(req.url).searchParams.get('id')

    if (id) {
      const analysis = await prisma.analysis.findFirst({
        where: { id, resume: { userId: session.user.id } },
        include: { resume: { select: { originalName: true, version: true } }, bulletRewrites: true },
      })
      if (!analysis) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json(analysis)
    }

    const analyses = await prisma.analysis.findMany({
      where: { resume: { userId: session.user.id } },
      include: { resume: { select: { originalName: true, version: true } } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
    return NextResponse.json(analyses)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
