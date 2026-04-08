# 🧠 ResumeIQ — AI Resume Analyzer

> Production-grade AI resume platform. Upload PDF/DOCX → get ATS scores, job matching, bullet rewrites, and keyword gaps — powered by LLaMA3 (free via Groq).

![Tech Stack](https://img.shields.io/badge/Next.js-14-black) ![AI](https://img.shields.io/badge/Groq-LLaMA3-orange) ![DB](https://img.shields.io/badge/PostgreSQL-Prisma-blue) ![Auth](https://img.shields.io/badge/NextAuth-Google%2BEmail-green) ![Storage](https://img.shields.io/badge/Cloudinary-free-purple)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 ATS Score | 0–100 compatibility score with section breakdown |
| 🎯 Job Matching | Paste any JD → get match %, missing skills, keywords |
| ⚡ Bullet Rewriter | AI rewrites weak bullets with action verbs + metrics |
| 🔑 Keyword Gap | High/medium/low priority keywords missing from resume |
| 📈 Dashboard | Score timeline, resume versions, job match history |
| 🔀 Compare | Side-by-side comparison of two resume versions |
| 🔐 Auth | Google OAuth + email/password via NextAuth |
| ☁️ Storage | Cloudinary for PDF/DOCX file hosting |

---

## 🗂️ Project Structure

```
resumeiq/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login page
│   │   └── register/page.tsx       # Register page
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard shell + sidebar
│   │   ├── dashboard/page.tsx      # Main dashboard (server)
│   │   ├── upload/page.tsx         # Upload + analysis flow (client)
│   │   ├── analysis/[id]/page.tsx  # Full analysis result (server)
│   │   └── compare/page.tsx        # Resume comparison (client)
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth handler
│   │   ├── register/               # Email registration
│   │   ├── resume/
│   │   │   ├── upload/             # POST upload, GET list
│   │   │   └── [id]/               # GET detail, DELETE
│   │   ├── analyze/                # POST AI analysis, GET history
│   │   ├── job-match/              # POST job match, GET history
│   │   ├── rewrite/                # POST bullet rewrite
│   │   └── dashboard/              # GET dashboard stats
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                    # Landing page
│   └── not-found.tsx
│
├── components/
│   ├── layout/
│   │   ├── Providers.tsx           # SessionProvider wrapper
│   │   └── Sidebar.tsx             # Dashboard sidebar nav
│   ├── resume/
│   │   ├── ScoreRing.tsx           # Animated SVG score ring
│   │   ├── JobMatchSection.tsx     # Collapsible job match UI
│   │   ├── BulletRewriteSection.tsx# Bullet rewrite UI
│   │   └── KeywordOptimizer.tsx    # Keyword gap UI
│   └── dashboard/
│       └── ScoreChart.tsx          # Recharts area chart
│
├── lib/
│   ├── prisma.ts                   # Prisma singleton
│   ├── auth.ts                     # NextAuth options
│   ├── groq.ts                     # Groq API client
│   ├── prompts.ts                  # Engineered AI prompts
│   ├── parser.ts                   # PDF/DOCX text extraction
│   ├── cloudinary.ts               # File upload/delete
│   ├── rate-limit.ts               # In-memory rate limiter
│   └── utils.ts                    # cn(), formatBytes(), etc.
│
├── prisma/
│   └── schema.prisma               # DB schema (User, Resume, Analysis, JobMatch)
│
├── types/
│   └── index.ts                    # TypeScript interfaces
│
├── middleware.ts                   # Route protection
├── next.config.js
├── tailwind.config.js
├── vercel.json
└── .env.example
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Source | Notes |
|---|---|---|
| `DATABASE_URL` | Supabase | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Generated | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your URL | `http://localhost:3000` in dev |
| `GOOGLE_CLIENT_ID` | Google Cloud Console | OAuth 2.0 credential |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console | OAuth 2.0 credential |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard | Free 25GB |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard | |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard | |
| `GROQ_API_KEY` | console.groq.com | Free LLaMA3 access |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- npm / pnpm
- A free Supabase account
- A free Groq account
- A free Cloudinary account
- A free Google Cloud project (for OAuth)

### Step 1 — Install

```bash
git clone <your-repo-url>
cd resumeiq
npm install
```

### Step 2 — Environment

```bash
cp .env.example .env.local
# Fill in all variables (see table above)
```

### Step 3 — Database

```bash
# Push schema to Supabase
npx prisma db push

# Optional: view data in Prisma Studio
npx prisma studio
```

### Step 4 — Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## 🗄️ Database Schema

```prisma
User          → accounts, sessions, resumes, jobMatches
Resume        → userId, fileName, fileUrl, parsedText, version, analyses, jobMatches
Analysis      → resumeId, atsScore, strengths[], weaknesses[], missingKeywords[], 
                improvements[], sectionFeedback{}, careerTips[], bulletRewrites[]
JobMatch      → userId, resumeId, jobTitle, matchScore, missingSkills[], 
                presentSkills[], suggestions[], keywordsToAdd[]
BulletRewrite → analysisId, original, rewritten, improvement
```

---

## 🌐 Deploy to Vercel + Supabase (Free)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourname/resumeiq.git
git push -u origin main
```

### 2. Create Supabase Database

1. Go to [supabase.com](https://supabase.com) → New Project
2. Settings → Database → Copy **URI** connection string
3. Replace `[YOUR-PASSWORD]` in the URI

### 3. Deploy to Vercel

```bash
# Option A: Vercel CLI
npm i -g vercel
vercel

# Option B: Connect GitHub repo at vercel.com
# Import → Select repo → Configure
```

### 4. Set Environment Variables in Vercel

In Vercel Dashboard → Project → Settings → Environment Variables, add all variables from `.env.example`.

```bash
# Or via CLI:
vercel env add DATABASE_URL production
vercel env add GROQ_API_KEY production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
# ... add remaining vars
```

### 5. Run Prisma Migration

```bash
# With DATABASE_URL set in your local .env.local pointing to Supabase:
npx prisma db push
```

### 6. Update Google OAuth Redirect URIs

In Google Cloud Console → Credentials → Your OAuth Client:
- Add `https://your-vercel-domain.vercel.app/api/auth/callback/google`

### 7. Redeploy

```bash
vercel --prod
```

---

## 🔒 Security Features

- **Route Protection** — NextAuth middleware blocks all `/dashboard/*` without session
- **Ownership Checks** — Every DB query verifies `userId` matches session
- **Prompt Injection Prevention** — Input sanitization strips `[SYSTEM]`, `[INST]`, `` ``` ``, and common injection phrases
- **File Validation** — MIME type + extension check + 5MB size limit
- **Rate Limiting** — In-memory limits: 10 analyses/hr, 20 uploads/hr, 20 job matches/hr per user
- **API Key Security** — All secrets are server-side env vars, never exposed to client
- **Input Clamping** — All AI text inputs truncated before sending to Groq

---

## 🧠 AI Prompt Architecture

All prompts are in `lib/prompts.ts` and follow these principles:

1. **Structured JSON output** — System prompt explicitly demands `ONLY valid JSON`
2. **Low temperature (0.1)** — Near-deterministic responses every time
3. **Input sanitization** — Strip injection attempts before sending
4. **Token limits** — Inputs truncated (resume: 7000 chars, JD: 2500 chars)
5. **Schema enforcement** — Response shape defined in prompt, normalized in API
6. **Fallback parsing** — `parseJsonResponse()` strips markdown fences, extracts JSON objects from mixed content

---

## ⚡ Performance

- **Server Components** — Dashboard and analysis pages are React Server Components (no client JS)
- **Edge Middleware** — Auth check runs at edge before any server processing
- **Prisma Connection Pooling** — Singleton prevents connection exhaustion in serverless
- **Streaming** — Vercel functions configured up to 30s for AI calls
- **Parallel DB Queries** — `Promise.all()` for dashboard stats

---

## 📈 Rate Limits

| Endpoint | Limit | Window |
|---|---|---|
| Resume Upload | 20 | per hour |
| AI Analysis | 10 | per hour |
| Job Match | 20 | per hour |
| Bullet Rewrite | 30 | per hour |

All limits are per-user (keyed by user ID).

---

## 🆓 Free Tier Usage

| Service | Free Allowance |
|---|---|
| Supabase | 500MB DB, 2GB bandwidth |
| Groq | ~14,400 requests/day (LLaMA3-70B) |
| Cloudinary | 25GB storage, 25GB bandwidth |
| Vercel | 100GB bandwidth, unlimited deployments |
| Google OAuth | Unlimited |

---

## 🔧 Customization

### Switch AI Provider

Replace `lib/groq.ts` with any provider. The prompts in `lib/prompts.ts` are provider-agnostic.

**OpenRouter (alternative free models):**
```ts
const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
  body: JSON.stringify({ model: 'meta-llama/llama-3-70b-instruct:free', messages })
})
```

### Add More Auth Providers

In `lib/auth.ts`, add any NextAuth provider:
```ts
import GitHubProvider from 'next-auth/providers/github'
// Add to providers array
```

---

## 📄 License

MIT — free to use, modify, and deploy.
