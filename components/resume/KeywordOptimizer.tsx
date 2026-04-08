'use client'
// components/resume/KeywordOptimizer.tsx
import { useState } from 'react'
import { Tag, Loader2, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { KeywordOptimizeResult } from '@/types'

export function KeywordOptimizer({ resumeText }: { resumeText: string }) {
  const [open, setOpen] = useState(false)
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<KeywordOptimizeResult | null>(null)

  async function analyze() {
    if (jobDesc.trim().length < 50) { toast.error('Paste a job description of at least 50 characters'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/job-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: 'keyword-only',
          jobTitle: 'Keyword Analysis',
          jobDescription: jobDesc,
        }),
      })
      // For keyword optimizer we can repurpose job-match or add dedicated endpoint
      // Using a simple client-side extraction for now as fallback
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Map job match result to keyword format
      const mapped: KeywordOptimizeResult = {
        highPriority: data.result.keywordsToAdd?.slice(0, 4) ?? [],
        mediumPriority: data.result.missingSkills?.slice(0, 4) ?? [],
        lowPriority: [],
        alreadyPresent: data.result.presentSkills?.slice(0, 5) ?? [],
        placementSuggestions: {
          skills_section: data.result.keywordsToAdd?.slice(0, 2) ?? [],
          experience_section: data.result.suggestions?.slice(0, 1) ?? [],
          summary_section: data.result.keywordsToAdd?.slice(2, 4) ?? [],
        },
      }
      setResult(mapped)
    } catch (e: any) {
      toast.error(e.message ?? 'Keyword analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const badges: { label: string; key: keyof KeywordOptimizeResult; color: string; bg: string; border: string; icon: any; prefix: string }[] = [
    { label: 'High Priority', key: 'highPriority', color: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertCircle, prefix: '‼ ' },
    { label: 'Medium Priority', key: 'mediumPriority', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Tag, prefix: '! ' },
    { label: 'Low Priority', key: 'lowPriority', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Tag, prefix: '+ ' },
    { label: 'Already Present', key: 'alreadyPresent', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2, prefix: '✓ ' },
  ]

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-foreground">Keyword Optimizer</span>
          {result && (
            <span className="text-xs px-2 py-0.5 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-300 font-medium ml-2">
              {result.highPriority.length + result.mediumPriority.length} to add
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-border pt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Job Description <span className="text-muted-foreground/60">(for keyword gap analysis)</span>
            </label>
            <textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste a job description to find missing keywords…"
              rows={5}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
            />
          </div>

          <button
            onClick={analyze}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
            {loading ? 'Analyzing…' : 'Find Missing Keywords'}
          </button>

          {result && (
            <div className="space-y-4 pt-2">
              <div className="grid md:grid-cols-2 gap-4">
                {badges.map(({ label, key, color, bg, border, prefix }) => {
                  const items = result[key] as string[]
                  if (!items?.length) return null
                  return (
                    <div key={key}>
                      <p className="text-xs font-medium text-foreground mb-2">{label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {items.map(k => (
                          <span key={k} className={cn('keyword-badge text-xs px-2.5 py-1 rounded-lg border', color, bg, border)}>
                            {prefix}{k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {result.placementSuggestions && (
                <div className="border border-border rounded-xl p-4 bg-secondary/20">
                  <p className="text-xs font-medium text-foreground mb-3">Where to Place Keywords</p>
                  <div className="space-y-2">
                    {Object.entries(result.placementSuggestions).map(([section, keywords]) => {
                      if (!keywords?.length) return null
                      return (
                        <div key={section} className="flex items-start gap-2">
                          <span className="text-xs text-muted-foreground capitalize w-36 flex-shrink-0">{section.replace(/_/g, ' ')}:</span>
                          <div className="flex flex-wrap gap-1">
                            {keywords.map((k: string) => (
                              <span key={k} className="text-xs text-primary">{k}</span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
