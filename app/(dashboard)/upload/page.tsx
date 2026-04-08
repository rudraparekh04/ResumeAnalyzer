'use client'
// app/(dashboard)/upload/page.tsx
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import {
  Upload, FileText, CheckCircle2, Loader2, X, Brain,
  ChevronRight, AlertCircle, Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatBytes } from '@/lib/utils'

type Step = 'idle' | 'uploading' | 'parsing' | 'analyzing' | 'done' | 'error'

interface UploadResult {
  resumeId: string
  fileName: string
  wordCount: number
  sections: Record<string, boolean>
}

const STEP_LABELS: Record<Step, string> = {
  idle: 'Ready',
  uploading: 'Uploading file…',
  parsing: 'Extracting resume text…',
  analyzing: 'Running AI analysis…',
  done: 'Analysis complete!',
  error: 'Something went wrong',
}

const STEP_PROGRESS: Record<Step, number> = {
  idle: 0, uploading: 25, parsing: 50, analyzing: 80, done: 100, error: 0,
}

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<Step>('idle')
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'docx', 'doc'].includes(ext ?? '')) {
      toast.error('Only PDF and DOCX files accepted')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }
    setFile(f)
    setStep('idle')
    setError(null)
    setUploadResult(null)
    setAnalysisId(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  })

  async function handleAnalyze() {
    if (!file) return
    setError(null)

    try {
      // Step 1: Upload
      setStep('uploading')
      const fd = new FormData()
      fd.append('file', file)
      const upRes = await fetch('/api/resume/upload', { method: 'POST', body: fd })
      const upData = await upRes.json()
      if (!upRes.ok) throw new Error(upData.error ?? 'Upload failed')
      setUploadResult(upData)

      // Step 2: Parse (UI feedback)
      setStep('parsing')
      await new Promise(r => setTimeout(r, 600))

      // Step 3: AI Analysis
      setStep('analyzing')
      const anRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: upData.resumeId }),
      })
      const anData = await anRes.json()
      if (!anRes.ok) throw new Error(anData.error ?? 'Analysis failed')

      setAnalysisId(anData.analysisId)
      setStep('done')
      toast.success('Analysis complete! Redirecting…')
      setTimeout(() => router.push(`/analysis/${anData.analysisId}`), 1200)
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
      setStep('error')
      toast.error(e.message ?? 'Something went wrong')
    }
  }

  const isProcessing = ['uploading', 'parsing', 'analyzing'].includes(step)
  const progress = STEP_PROGRESS[step]

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-foreground mb-2">Upload Resume</h1>
          <p className="text-sm text-muted-foreground">PDF or DOCX · Max 5MB · AI analysis takes ~10 seconds</p>
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer transition-all duration-300',
            isDragActive && 'dropzone-active',
            file && !isProcessing && 'border-primary/40 bg-primary/5',
            isProcessing && 'pointer-events-none opacity-75'
          )}
        >
          <input {...getInputProps()} />

          {!file ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary/60 border border-border flex items-center justify-center">
                <Upload className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground mb-1">
                  {isDragActive ? 'Drop it here!' : 'Drop your resume here'}
                </p>
                <p className="text-sm text-muted-foreground">or click to browse · PDF, DOCX · max 5MB</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(file.size)}</p>
                {uploadResult && (
                  <p className="text-xs text-primary mt-1">
                    {uploadResult.wordCount} words extracted
                  </p>
                )}
              </div>
              {!isProcessing && (
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setStep('idle'); setError(null) }}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Progress */}
        {isProcessing && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                {STEP_LABELS[step]}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Analysis complete! Opening results…
          </div>
        )}

        {/* Error */}
        {step === 'error' && error && (
          <div className="mt-4 flex items-start gap-2.5 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Analysis failed</p>
              <p className="text-xs text-destructive/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* CTA */}
        {file && !isProcessing && step !== 'done' && (
          <button
            onClick={handleAnalyze}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 group"
          >
            <Sparkles className="w-4 h-4" />
            Analyze with AI
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {/* Feature hints */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          {[
            { icon: Brain, label: 'ATS Score', desc: 'Know your compatibility' },
            { icon: ChevronRight, label: 'Job Matching', desc: 'Paste any JD to match' },
            { icon: Sparkles, label: 'Bullet Rewriter', desc: 'AI-powered improvements' },
            { icon: FileText, label: 'Keyword Gap', desc: 'Missing keywords found' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-4 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">{label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
