// app/(dashboard)/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { Upload, TrendingUp, FileText, Target, ArrowRight, Plus, Clock } from 'lucide-react'

import { ScoreChart } from '@/components/dashboard/ScoreChart'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cn, getScoreTailwind, timeAgo } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type DashboardAnalysis = {
  atsScore: number
  createdAt: Date
}

type DashboardResume = {
  id: string
  originalName: string
  createdAt: Date
  version: number
  analyses: Array<{
    id: string
    atsScore: number
    createdAt: Date
  }>
}

type DashboardJobMatch = {
  id: string
  jobTitle: string
  matchScore: number
  createdAt: Date
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const [resumes, allAnalyses, jobMatches] = await Promise.all([
    prisma.resume.findMany({
      where: { userId, isActive: true },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, atsScore: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.analysis.findMany({
      where: { resume: { userId } },
      select: { atsScore: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: 12,
    }),
    prisma.jobMatch.findMany({
      where: { userId },
      select: { jobTitle: true, matchScore: true, createdAt: true, id: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
  ])

  const scores = allAnalyses.map((analysis: DashboardAnalysis) => analysis.atsScore)
  const avgScore = scores.length
    ? Math.round(scores.reduce((total: number, score: number) => total + score, 0) / scores.length)
    : 0
  const bestScore = scores.length ? Math.max(...scores) : 0
  const latestScore = scores.length ? scores[scores.length - 1] : null

  const chartData = allAnalyses.map((analysis: DashboardAnalysis, index: number) => ({
    name: `#${index + 1}`,
    score: analysis.atsScore,
    date: new Date(analysis.createdAt).toLocaleDateString(),
  }))

  const stats = [
    { label: 'Resumes', value: resumes.length, icon: FileText, color: 'text-blue-400' },
    { label: 'Analyses', value: allAnalyses.length, icon: TrendingUp, color: 'text-primary' },
    { label: 'Job Matches', value: jobMatches.length, icon: Target, color: 'text-purple-400' },
    { label: 'Avg ATS Score', value: avgScore ? `${avgScore}` : '-', icon: TrendingUp, color: getScoreTailwind(avgScore).text },
  ]

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {resumes.length === 0 ? 'Upload your first resume to get started' : `${resumes.length} resume${resumes.length > 1 ? 's' : ''} analyzed`}
            </p>
          </div>
          <Link
            href="/upload"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Upload Resume
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon className={cn('w-4 h-4', stat.color)} />
              </div>
              <p className={cn('text-3xl font-display', stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-medium text-foreground mb-1">ATS Score Timeline</h2>
            <p className="text-xs text-muted-foreground mb-4">Score progression across analyses</p>
            {chartData.length > 0 ? (
              <ScoreChart data={chartData} />
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center">
                <TrendingUp className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No analyses yet</p>
                <Link href="/upload" className="text-xs text-primary mt-1 hover:underline">
                  Upload a resume to start
                </Link>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-medium text-foreground mb-4">Score Summary</h2>
            <div className="space-y-4">
              {[
                { label: 'Latest Score', value: latestScore, suffix: '/100' },
                { label: 'Best Score', value: bestScore || null, suffix: '/100' },
                { label: 'Average Score', value: avgScore || null, suffix: '/100' },
              ].map(({ label, value, suffix }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  {value != null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${value}%`,
                            backgroundColor: getScoreTailwind(value).text.replace('text-', '').includes('emerald') ? '#10b981' : '#f59e0b',
                          }}
                        />
                      </div>
                      <span className={cn('text-sm font-medium tabular-nums', getScoreTailwind(value).text)}>
                        {value}
                        {suffix}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">Recent Resumes</h2>
            <Link href="/upload" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              Upload new <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {resumes.length === 0 ? (
            <div className="p-12 text-center">
              <Upload className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No resumes yet</p>
              <Link href="/upload" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> Upload your first resume
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {resumes.map((resume: DashboardResume) => {
                const latest = resume.analyses[0]
                const colors = latest ? getScoreTailwind(latest.atsScore) : null

                return (
                  <div key={resume.id} className="flex items-center justify-between px-6 py-4 hover:bg-secondary/20 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {resume.originalName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{timeAgo(resume.createdAt)} - v{resume.version}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {latest && colors ? (
                        <span className={cn('text-xs font-medium px-2.5 py-1 rounded-lg border', colors.text, colors.bg, colors.border)}>
                          {latest.atsScore}/100
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground px-2.5 py-1 rounded-lg border border-border bg-secondary/30">Not analyzed</span>
                      )}
                      {latest && (
                        <Link href={`/analysis/${latest.id}`} className="text-xs text-primary hover:text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity">
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {jobMatches.length > 0 && (
          <div className="bg-card border border-border rounded-xl">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-medium text-foreground">Recent Job Matches</h2>
            </div>
            <div className="divide-y divide-border">
              {jobMatches.map((jobMatch: DashboardJobMatch) => {
                const colors = getScoreTailwind(jobMatch.matchScore)

                return (
                  <div key={jobMatch.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{jobMatch.jobTitle}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(jobMatch.createdAt)}</p>
                    </div>
                    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-lg border', colors.text, colors.bg, colors.border)}>
                      {jobMatch.matchScore}% match
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
