// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: { default: 'ResumeIQ — AI Resume Analyzer', template: '%s | ResumeIQ' },
  description: 'Analyze your resume with AI. Get ATS scores, skill gap analysis, job matching, and bullet point rewrites powered by LLaMA3.',
  keywords: ['resume analyzer', 'ATS score', 'resume AI', 'job matching', 'career tools'],
  openGraph: {
    title: 'ResumeIQ — AI Resume Analyzer',
    description: 'Get your resume ATS-ready with AI-powered analysis',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'hsl(222 18% 9%)',
                border: '1px solid hsl(222 16% 16%)',
                color: 'hsl(210 20% 94%)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
