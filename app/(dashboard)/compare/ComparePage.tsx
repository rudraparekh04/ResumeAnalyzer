'use client'
// app/(dashboard)/compare/page.tsx
import { useEffect, useState } from 'react'
import { GitCompare, TrendingUp, TrendingDown, Minus, Loader2, FileText } from 'lucide-react'

import { cn, getScoreTailwind, getScoreLabel, timeAgo } from '@/lib/utils'

interface ResumeItem {
  id: string
  originalName: string
  version: number
  createdAt: string
  analyses: { id: string; atsScore: number; createdAt: string }[]
}

export default function ComparePage() {
  const [resumes, setResumes] = useState<ResumeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [leftId, setLeftId] = useState('')
  const [rightId, setRightId] = useState('')

  useEffect(() => {
    fetch('/api/resume/upload')
      .then((response) => response.json())
      .then((data: ResumeItem[]) => {
        setResumes(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const left = resumes.find((resume: ResumeItem) => resume.id === leftId)
  const right = resumes.find((resume: ResumeItem) => resume.id === rightId)

  const leftScore = left?.analyses[0]?.atsScore ?? null
  const rightScore = right?.analyses[0]?.atsScore ?? null

  function ScoreDelta() {
    if (leftScore === null || rightScore === null) return null

    const diff = rightScore - leftScore

    if (diff === 0) {
      return (
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <Minus className="w-4 h-4" /> No change
        </div>
      )
    }

    if (diff > 0) {
      return (
        <div className="flex items-center gap-1 text-emerald-400 text-sm">
          <TrendingUp className="w-4 h-4" /> +{diff} points improvement
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1 text-red-400 text-sm">
        <TrendingDown className="w-4 h-4" /> {diff} points decrease
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-foreground mb-2">Compare Resumes</h1>
          <p className="text-sm text-muted-foreground">Select two resume versions to compare their ATS scores side by side</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : resumes.length < 2 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <GitCompare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-base font-medium text-foreground mb-2">Upload at least 2 resumes to compare</p>
            <p className="text-sm text-muted-foreground mb-6">You need multiple resume versions to use this feature</p>
            <a href="/upload" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Upload Resume
            </a>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-5 mb-6">
              {[
                { label: 'Resume A (baseline)', id: leftId, setId: setLeftId, color: 'border-blue-500/30 bg-blue-500/5' },
                { label: 'Resume B (comparison)', id: rightId, setId: setRightId, color: 'border-purple-500/30 bg-purple-500/5' },
              ].map(({ label, id, setId }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">{label}</label>
                  <select
                    value={id}
                    onChange={(event) => setId(event.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  >
                    <option value="">- Select a resume -</option>
                    {resumes.map((resume: ResumeItem) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.originalName} (v{resume.version}) - {resume.analyses[0] ? `${resume.analyses[0].atsScore}/100` : 'Not analyzed'}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {left && right && (
              <div className="space-y-5">
                <div className="flex items-center justify-center py-3 bg-card border border-border rounded-xl gap-4">
                  <ScoreDelta />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {[
                    { resume: left, score: leftScore, label: 'Resume A', accent: 'border-blue-500/25 bg-blue-500/5' },
                    { resume: right, score: rightScore, label: 'Resume B', accent: 'border-purple-500/25 bg-purple-500/5' },
                  ].map(({ resume, score, accent, label }) => {
                    const colors = score !== null ? getScoreTailwind(score) : null

                    return (
                      <div key={resume.id} className={cn('rounded-xl border p-6', accent)}>
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{resume.originalName}</p>
                            <p className="text-xs text-muted-foreground">v{resume.version} - {timeAgo(resume.createdAt)}</p>
                          </div>
                        </div>

                        {score !== null && colors ? (
                          <>
                            <div className={cn('text-5xl font-display mb-1', colors.text)}>{score}</div>
                            <div className="text-sm text-muted-foreground mb-4">{getScoreLabel(score)} - ATS Score</div>
                            <div className="h-2 bg-secondary/60 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${score}%`,
                                  backgroundColor: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444',
                                  transition: 'width 0.8s ease',
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="py-4 text-center">
                            <p className="text-sm text-muted-foreground">Not yet analyzed</p>
                            <a href="/upload" className="text-xs text-primary hover:underline mt-1 block">
                              Analyze now
                            </a>
                          </div>
                        )}

                        {resume.analyses[0] && (
                          <a
                            href={`/analysis/${resume.analyses[0].id}`}
                            className="mt-4 block text-center text-xs text-primary border border-primary/20 rounded-lg py-2 hover:bg-primary/5 transition-colors"
                          >
                            View full analysis
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>

                {leftScore !== null && rightScore !== null && (
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-sm font-medium text-foreground mb-4">Score Comparison</h3>
                    <div className="space-y-3">
                      {[
                        { label: left.originalName, score: leftScore, color: '#3b82f6' },
                        { label: right.originalName, score: rightScore, color: '#a855f7' },
                      ].map(({ label, score, color }) => (
                        <div key={label} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-36 truncate">{label}</span>
                          <div className="flex-1 h-2.5 bg-secondary/60 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${score}%`, backgroundColor: color, transition: 'width 0.8s ease' }}
                            />
                          </div>
                          <span className="text-sm font-medium tabular-nums" style={{ color }}>
                            {score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
