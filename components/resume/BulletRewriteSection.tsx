'use client'
// components/resume/BulletRewriteSection.tsx
import { useState } from 'react'
import { Zap, Loader2, ChevronDown, ChevronUp, Plus, X, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { extractBullets } from '@/lib/bullets'
import type { BulletRewriteResult } from '@/types'

interface Props {
  resumeText: string
  analysisId: string
}

export function BulletRewriteSection({ resumeText, analysisId }: Props) {
  const [open, setOpen] = useState(false)
  const [bullets, setBullets] = useState<string[]>([])
  const [custom, setCustom] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<BulletRewriteResult[]>([])

  function loadFromResume() {
    const extracted = extractBullets(resumeText)
    setBullets(extracted.slice(0, 8))
    toast.success(`Loaded ${Math.min(extracted.length, 8)} bullet points from your resume`)
  }

  function addCustom() {
    if (!custom.trim() || custom.trim().length < 5) return
    setBullets(prev => [...prev, custom.trim()])
    setCustom('')
  }
  const handleUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/parse-pdf', {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()

  if (!res.ok) {
    console.error(data.error)
    return
  }

  console.log(data)
}

  function removeBullet(i: number) {
    setBullets(prev => prev.filter((_, idx) => idx !== i))
  }

  async function rewrite() {
    if (bullets.length === 0) { toast.error('Add at least one bullet point'); return }
    setLoading(true)
    setResults([])
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullets, analysisId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResults(data.results)
      toast.success(`${data.results.length} bullets rewritten!`)
    } catch (e: any) {
      toast.error(e.message ?? 'Rewrite failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-foreground">Bullet Point Rewriter</span>
          {results.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-300 font-medium ml-2">
              {results.length} rewritten
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-border pt-5 space-y-4">
          <div className="flex gap-3">
            <button
              onClick={loadFromResume}
              className="text-xs px-3 py-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              Extract from resume
            </button>
            <span className="text-xs text-muted-foreground self-center">or add manually below</span>
          </div>

          {/* Bullet list */}
          {bullets.length > 0 && (
            <div className="space-y-2">
              {bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-secondary/30 rounded-lg group">
                  <span className="text-xs text-muted-foreground mt-0.5 w-5 flex-shrink-0">{i + 1}.</span>
                  <p className="text-sm text-muted-foreground flex-1 leading-relaxed">{b}</p>
                  <button onClick={() => removeBullet(i)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add custom */}
          <div className="flex gap-2">
            <input
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
              placeholder="Add a bullet point to rewrite…"
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
            <button onClick={addCustom} className="p-2 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={rewrite}
            disabled={loading || bullets.length === 0}
            className="flex items-center gap-2 bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-500 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? 'Rewriting…' : `Rewrite ${bullets.length} Bullet${bullets.length !== 1 ? 's' : ''}`}
          </button>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-medium text-foreground">Rewritten Bullets</h3>
              {results.map((r, i) => (
                <div key={i} className="border border-border rounded-xl overflow-hidden">
                  <div className="p-4 bg-secondary/20">
                    <p className="text-xs text-muted-foreground/60 mb-1">Original</p>
                    <p className="text-sm text-muted-foreground line-through">{r.original}</p>
                  </div>
                  <div className="p-4 bg-emerald-500/5 border-t border-emerald-500/15">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ArrowRight className="w-3 h-3 text-emerald-400" />
                      <p className="text-xs text-emerald-400 font-medium">Rewritten</p>
                    </div>
                    <p className="text-sm text-foreground font-medium leading-relaxed">{r.rewritten}</p>
                    {r.improvement && (
                      <p className="text-xs text-muted-foreground mt-2 italic">💡 {r.improvement}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
