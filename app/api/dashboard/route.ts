// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = session.user.id

    const [resumes, allAnalyses, jobMatches] = await Promise.all([
      prisma.resume.findMany({
        where: { userId, isActive: true },
        include: {
          analyses: {
            select: { id: true, atsScore: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.analysis.findMany({
        where: { resume: { userId } },
        select: { atsScore: true, createdAt: true, resumeId: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.jobMatch.findMany({
        where: { userId },
        select: { id: true, jobTitle: true, matchScore: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    const scores = allAnalyses.map((analysis: { atsScore: number }) => analysis.atsScore)
    const stats = {
      totalResumes: resumes.length,
      totalAnalyses: allAnalyses.length,
      totalJobMatches: jobMatches.length,
      averageScore: scores.length ? Math.round(scores.reduce((total: number, score: number) => total + score, 0) / scores.length) : 0,
      bestScore: scores.length ? Math.max(...scores) : 0,
      latestScore: scores.length ? scores[scores.length - 1] : null,
    }

    // Score timeline for chart (last 10 analyses)
    const scoreTimeline = allAnalyses.slice(-10).map((analysis: { createdAt: Date; atsScore: number }) => ({
      date: analysis.createdAt,
      score: analysis.atsScore,
    }))

    return NextResponse.json({ stats, resumes, jobMatches, scoreTimeline })
  } catch (e) {
    console.error('[DASHBOARD]', e)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
