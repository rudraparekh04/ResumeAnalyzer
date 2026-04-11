'use client'
// app/(auth)/register/page.tsx
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, Mail, Lock, User, Chrome, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const strongPassword =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/
  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
      console.log("DATABASE_URL =", process.env.DATABASE_URL)

//     if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
//     if (!/[A-Z]/.test(form.password)) {toast.error('Add at least 1 uppercase letter'); return}

// if (!/[a-z]/.test(form.password)) {toast.error('Add at least 1 lowercase letter');return}

// if (!/[0-9]/.test(form.password)) {toast.error('Add at least 1 number');return}
// console.log("Password:", form.password)
// console.log("Regex test:", strongPassword.test(form.password))
if (!strongPassword.test(form.password)) {
    console.log("FAILED VALIDATION")

  toast.error('Password must be strong (8+ chars, uppercase, lowercase, number, special char)')
  return
}
    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); setLoading(false); return }
      toast.success('Account created! Signing you in…')
      await signIn('credentials', { email: form.email, password: form.password, callbackUrl: '/dashboard' })
    } catch {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-xl text-foreground">ResumeIQ</span>
          </Link>
          <h1 className="text-2xl font-display text-foreground mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground">Free forever · No credit card needed</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 glow-primary">
          <button
            onClick={() => { setGoogleLoading(true); signIn('google', { callbackUrl: '/dashboard' }) }}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-2.5 text-sm text-foreground hover:bg-secondary/40 transition-colors mb-6 disabled:opacity-50"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Chrome className="w-4 h-4" />}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {[
              { key: 'name', label: 'Full name', icon: User, type: 'text', placeholder: 'Jane Smith' },
              { key: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'jane@example.com' },
              { key: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: '8+ characters' },
            ].map(({ key, label, icon: Icon, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={set(key as keyof typeof form)}
                    required
                    placeholder={placeholder}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-primary/20 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create free account
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
