'use client'
// components/resume/JobMatchSection.tsx
import { useState } from 'react'
import { Target, Loader2, CheckCircle2, XCircle, Lightbulb, Tag, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { cn, getScoreTailwind } from '@/lib/utils'
import type { JobMatchResult } from '@/types'

export function JobMatchSection({ resumeId }: { resumeId: string }) {
  const [open, setOpen] = useState(false)
  const [jobTitle, setJobTitle] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<JobMatchResult | null>(null)

  async function handleMatch() {
    if (!jobTitle.trim() || jobDesc.trim().length < 50) {
      toast.error('Please enter a job title and at least 50 characters of job description')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/job-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, jobTitle, jobDescription: jobDesc }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result)
      toast.success(`Match score: ${data.result.matchScore}%`)
    } catch (e: any) {
      toast.error(e.message ?? 'Job matching failed')
    } finally {
      setLoading(false)
    }
  }

  const colors = result ? getScoreTailwind(result.matchScore) : null

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-foreground">Job Match Analysis</span>
          {result && (
            <span className={cn('text-xs px-2 py-0.5 rounded-md border font-medium ml-2', colors!.text, colors!.bg, colors!.border)}>
              {result.matchScore}%
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-border pt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Job Title</label>
            <input
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Job Description <span className="text-muted-foreground/60">(paste the full JD)</span>
            </label>
            <textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste the full job description here…"
              rows={6}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">{jobDesc.length} / 10,000 chars</p>
          </div>

          <button
            onClick={handleMatch}
            disabled={loading}
            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-500 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
            {loading ? 'Matching…' : 'Match Resume to Job'}
          </button>

          {result && (
            <div className="space-y-4 pt-2">
              {/* Score banner */}
              <div className={cn('flex items-center justify-between p-4 rounded-xl border', colors!.bg, colors!.border)}>
                <div>
                  <p className="text-xs text-muted-foreground">Match Score</p>
                  <p className={cn('text-3xl font-display', colors!.text)}>{result.matchScore}%</p>
                </div>
                <p className="text-sm text-muted-foreground max-w-sm text-right">{result.analysis}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-medium text-foreground">Present Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.presentSkills.map(s => (
                      <span key={s} className="text-xs px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs font-medium text-foreground">Missing Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingSkills.map(s => (
                      <span key={s} className="text-xs px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-medium text-foreground">Keywords to Add</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywordsToAdd.map(k => (
                    <span key={k} className="text-xs px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg">+ {k}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-foreground">Suggestions</span>
                </div>
                <ul className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-xs font-bold text-amber-400 mt-0.5">{i + 1}</span>
                      <p className="text-sm text-muted-foreground">{s}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
