// app/page.tsx
import Link from 'next/link'
import { ArrowRight, Brain, FileText, Target, Zap, TrendingUp, CheckCircle2, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display text-lg text-foreground">ResumeIQ</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Sign in
            </Link>
            <Link href="/register" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-40" />
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8">
            <Zap className="w-3 h-3" />
            Powered by LLaMA3 via Groq — 100% Free
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-normal text-foreground mb-6 leading-tight">
            Your resume,{' '}
            <span className="text-primary text-glow italic">analyzed</span>
            <br />by AI in seconds
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your PDF or DOCX and instantly get an ATS score, skill gap analysis,
            job matching, and AI-rewritten bullet points that land interviews.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20">
              Analyze my resume free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3 rounded-xl font-medium hover:bg-secondary/50 transition-colors">
              Sign in
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            No credit card · No rate limits on free account · Instant results
          </p>
        </div>
      </section>

      {/* Score preview card */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border bg-card p-8 glow-primary">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-muted-foreground font-mono">AI Analysis Complete</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'ATS Score', value: '84/100', color: 'text-emerald-400', sub: 'Excellent' },
                { label: 'Job Match', value: '91%', color: 'text-primary', sub: 'Strong fit' },
                { label: 'Keywords', value: '+12', color: 'text-amber-400', sub: 'Missing' },
                { label: 'Bullets', value: '8x', color: 'text-blue-400', sub: 'Rewritten' },
              ].map((item) => (
                <div key={item.label} className="bg-background/60 rounded-xl p-4 border border-border/50">
                  <div className={`text-2xl font-display font-normal ${item.color} mb-1`}>{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground/60 mt-0.5">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 border-t border-border/50">
        <div className="max-w-5xl mx-auto pt-20">
          <h2 className="text-3xl md:text-4xl font-display text-center text-foreground mb-4">
            Everything your resume needs
          </h2>
          <p className="text-center text-muted-foreground mb-16">Six AI-powered tools in one platform</p>

          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:glow-primary transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 pb-24 border-t border-border/50">
        <div className="max-w-4xl mx-auto pt-20 text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
          </div>
          <blockquote className="text-xl font-display italic text-foreground mb-4">
            "Got 3 interviews in a week after using ResumeIQ to optimize my resume.
            The ATS score jumped from 52 to 89."
          </blockquote>
          <p className="text-sm text-muted-foreground">— Software Engineer, landed a FAANG role</p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-12">
            <h2 className="text-3xl font-display text-foreground mb-4">Ready to get hired?</h2>
            <p className="text-muted-foreground mb-8">Join thousands getting their resumes AI-optimized for free.</p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25">
              Analyze my resume — it's free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-display text-foreground">ResumeIQ</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with Next.js 14 · Groq LLaMA3 · Cloudinary · PostgreSQL
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: TrendingUp,
    title: 'ATS Score (0–100)',
    desc: 'Instant compatibility score with detailed section-by-section breakdown. Know exactly where you stand.',
  },
  {
    icon: Target,
    title: 'Job Match Analysis',
    desc: 'Paste any job description and get a match percentage, missing skills, and tailoring suggestions.',
  },
  {
    icon: Zap,
    title: 'Bullet Rewriter',
    desc: 'AI rewrites your bullets with strong action verbs and quantified results that hiring managers love.',
  },
  {
    icon: FileText,
    title: 'Keyword Optimizer',
    desc: 'High, medium, and low priority keywords to add—organized by placement in your resume.',
  },
  {
    icon: Brain,
    title: 'Skill Gap Analysis',
    desc: 'Pinpoint exactly what skills are missing for your target role and how to demonstrate them.',
  },
  {
    icon: CheckCircle2,
    title: 'Score Dashboard',
    desc: 'Track ATS scores over resume versions, compare multiple resumes, and chart your progress.',
  },
]
