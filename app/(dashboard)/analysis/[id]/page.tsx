// app/(dashboard)/analysis/[id]/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { cn, getScoreTailwind, getScoreLabel, timeAgo } from '@/lib/utils'
import { ScoreRing } from '@/components/resume/ScoreRing'
import { JobMatchSection } from '@/components/resume/JobMatchSection'
import { BulletRewriteSection } from '@/components/resume/BulletRewriteSection'
import { KeywordOptimizer } from '@/components/resume/KeywordOptimizer'
import {
  CheckCircle2, XCircle, Lightbulb, Tag, MessageSquare,
  FileText, Clock, ArrowLeft, Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface Props { params: { id: string } }

export default async function AnalysisPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  const analysis = await prisma.analysis.findFirst({
    where: { id: params.id, resume: { userId: session!.user.id } },
    include: { resume: { select: { id: true, originalName: true, parsedText: true, version: true } } },
  })

  if (!analysis) notFound()

  const { atsScore, strengths, weaknesses, missingKeywords, improvements, sectionFeedback, careerTips, resume } = analysis
  const colors = getScoreTailwind(atsScore)
  const sf = sectionFeedback as Record<string, string>

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back + header */}
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display text-foreground">{resume.originalName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {timeAgo(analysis.createdAt)}
                </span>
                <span className="text-xs text-muted-foreground">v{resume.version}</span>
              </div>
            </div>
            <div className={cn('flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium', colors.bg, colors.border, colors.text)}>
              <Sparkles className="w-4 h-4" />
              {getScoreLabel(atsScore)} ATS Score
            </div>
          </div>
        </div>

        {/* Score + quick stats */}
        <div className="grid md:grid-cols-3 gap-5 mb-8 slide-up">
          {/* Score ring */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center">
            <ScoreRing score={atsScore} />
            <p className="text-sm text-muted-foreground mt-3">ATS Compatibility Score</p>
          </div>

          {/* Section scores */}
          <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6">
            <h2 className="text-sm font-medium text-foreground mb-4">Section Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(sf).map(([key, feedback]) => {
                const label = key.charAt(0).toUpperCase() + key.slice(1)
                const quality = feedback.toLowerCase().includes('missing') || feedback.toLowerCase().includes('no ') || feedback.toLowerCase().includes('lack')
                  ? 'weak' : feedback.toLowerCase().includes('strong') || feedback.toLowerCase().includes('excellent') || feedback.toLowerCase().includes('good')
                  ? 'strong' : 'average'
                const dot = quality === 'strong' ? 'bg-emerald-400' : quality === 'weak' ? 'bg-red-400' : 'bg-amber-400'
                return (
                  <div key={key} className="flex items-start gap-3">
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', dot)} />
                    <div>
                      <span className="text-xs font-medium text-foreground">{label}: </span>
                      <span className="text-xs text-muted-foreground">{feedback}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Strengths + Weaknesses */}
        <div className="grid md:grid-cols-2 gap-5 mb-6 slide-up-1">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-medium text-foreground">Strengths</h2>
            </div>
            <ul className="space-y-3">
              {strengths.map((s:string, i:number) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{s}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-medium text-foreground">Weaknesses</h2>
            </div>
            <ul className="space-y-3">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{w}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Improvements */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6 slide-up-2">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-medium text-foreground">Suggested Improvements</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {improvements.map((imp, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/15 rounded-lg">
                <span className="text-xs font-bold text-amber-400 mt-0.5 flex-shrink-0">{i + 1}</span>
                <p className="text-sm text-muted-foreground leading-relaxed">{imp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6 slide-up-3">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-medium text-foreground">Missing Keywords</h2>
            <span className="text-xs text-muted-foreground ml-auto">{missingKeywords.length} keywords to add</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((kw) => (
              <span
                key={kw}
                className="keyword-badge text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 cursor-default"
              >
                + {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Career Tips */}
        {careerTips?.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6 slide-up-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-medium text-foreground">AI Career Tips</h2>
            </div>
            <div className="space-y-3">
              {careerTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/15 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive sections */}
        <div className="space-y-6 slide-up-5">
          <BulletRewriteSection resumeText={resume.parsedText} analysisId={analysis.id} />
          <JobMatchSection resumeId={resume.id} />
          <KeywordOptimizer resumeText={resume.parsedText} />
        </div>
      </div>
    </div>
  )
}
