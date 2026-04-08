// lib/prompts.ts
// Battle-tested prompts engineered for structured, deterministic JSON output

// ─── RESUME ANALYSIS ────────────────────────────────────────────────────────

export const RESUME_ANALYSIS_SYSTEM = `You are a world-class ATS (Applicant Tracking System) expert and senior technical recruiter with 15+ years at FAANG companies.

CRITICAL RULES:
1. Return ONLY a valid JSON object — no explanations, no markdown outside JSON
2. Be specific, actionable, and reference actual resume content
3. Never give generic advice like "improve your resume"
4. ATS score is a strict integer 0–100 based on the rubric below
5. All string arrays must have 3–6 items minimum

ATS SCORE RUBRIC:
90–100: Excellent — clean sections, quantified achievements, keyword-rich, ATS-parseable formatting
70–89:  Good — minor gaps in keywords or quantification
50–69:  Average — missing key sections or poor keyword density
30–49:  Poor — structural issues, no metrics, weak verbs
0–29:   Very Poor — unreadable by ATS, major content problems`

export function buildAnalysisPrompt(resumeText: string): string {
  const safe = sanitizeInput(resumeText, 7000)
  return `Analyze this resume thoroughly and return ONLY this exact JSON structure:

{
  "atsScore": <integer 0-100>,
  "strengths": [
    "Specific strength with evidence from resume",
    "Another concrete strength",
    "Third strength"
  ],
  "weaknesses": [
    "Specific weakness with recommendation to fix it",
    "Another weakness with fix",
    "Third weakness"
  ],
  "missingKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"],
  "improvements": [
    "Actionable improvement #1 — be specific about what to change and why",
    "Actionable improvement #2",
    "Actionable improvement #3",
    "Actionable improvement #4"
  ],
  "sectionFeedback": {
    "summary": "Specific feedback on the professional summary/objective. Note if missing.",
    "experience": "Feedback on bullet quality, quantification, action verbs, and impact statements.",
    "skills": "Feedback on skills section: completeness, relevance, organization.",
    "education": "Feedback on education section formatting and content.",
    "formatting": "ATS compatibility: fonts, columns, tables, special characters, file format."
  },
  "careerTips": [
    "Personalized career advancement tip based on their specific background",
    "Second personalized tip",
    "Third personalized tip"
  ]
}

RESUME TEXT:
===
${safe}
===

JSON only:`
}

// ─── JOB MATCHING ───────────────────────────────────────────────────────────

export const JOB_MATCH_SYSTEM = `You are an expert technical recruiter who precisely quantifies how well a resume matches a job description.
Return ONLY valid JSON. Never add text outside the JSON object.`

export function buildJobMatchPrompt(resumeText: string, jobDescription: string): string {
  const safeResume = sanitizeInput(resumeText, 3500)
  const safeJob = sanitizeInput(jobDescription, 2500)
  return `Score how well this resume matches this job description. Return ONLY this JSON:

{
  "matchScore": <integer 0-100>,
  "presentSkills": ["skill from resume that matches job requirement", "skill2", "skill3"],
  "missingSkills": ["critical skill the job requires but resume lacks", "skill2", "skill3"],
  "keywordsToAdd": ["high-impact keyword to add", "keyword2", "keyword3", "keyword4", "keyword5"],
  "suggestions": [
    "Specific way to tailor resume for this role — reference actual job requirements",
    "Second targeted suggestion",
    "Third targeted suggestion"
  ],
  "analysis": "2-3 sentence honest assessment of fit and the 1-2 most critical gaps to address."
}

Match Score Formula:
- Required skills present: 60% weight
- Years of experience match: 15% weight
- Industry/domain alignment: 15% weight
- Education match: 10% weight

RESUME:
===
${safeResume}
===

JOB DESCRIPTION:
===
${safeJob}
===

JSON only:`
}

// ─── BULLET REWRITER ────────────────────────────────────────────────────────

export const BULLET_REWRITE_SYSTEM = `You are an elite resume writer who transforms weak bullet points into powerful, ATS-optimized achievement statements.

REWRITING RULES:
- Always start with a strong action verb (Engineered, Spearheaded, Architected, Reduced, Increased, Delivered, Automated, Led, etc.)
- Quantify results: add %, $, time saved, users, scale — if not in original, use reasonable framing like "significantly" or keep qualitative
- Remove: "responsible for", "helped with", "worked on", "assisted with", "participated in"
- Keep under 200 characters
- Never fabricate specific numbers not implied by original
Return ONLY a JSON array.`

export function buildBulletRewritePrompt(bullets: string[]): string {
  const list = bullets.slice(0, 10).map((b, i) => `${i + 1}. ${sanitizeInput(b, 300)}`).join('\n')
  return `Rewrite these resume bullets to be more impactful and ATS-friendly.

Return ONLY this JSON array (one object per bullet):
[
  {
    "original": "exact original text",
    "rewritten": "Powerful rewrite starting with action verb + quantified result",
    "improvement": "Brief note: what specific change makes this stronger"
  }
]

BULLETS:
${list}

JSON array only:`
}

// ─── KEYWORD OPTIMIZER ──────────────────────────────────────────────────────

export const KEYWORD_OPTIMIZE_SYSTEM = `You are an ATS keyword optimization expert. Identify exactly which keywords from a job description are missing from or underrepresented in a resume. Return ONLY valid JSON.`

export function buildKeywordOptimizePrompt(resumeText: string, jobDescription: string): string {
  return `Perform keyword gap analysis. Return ONLY this JSON:

{
  "highPriority": ["critical missing keyword 1", "keyword2", "keyword3"],
  "mediumPriority": ["important but not critical keyword", "keyword2", "keyword3"],
  "lowPriority": ["nice-to-have keyword", "keyword2"],
  "alreadyPresent": ["keyword already well-represented in resume", "keyword2", "keyword3"],
  "placementSuggestions": {
    "skills_section": ["keyword to add directly to skills list"],
    "experience_section": ["phrase to weave into bullet points naturally"],
    "summary_section": ["keyword to include in professional summary"]
  }
}

RESUME: ${sanitizeInput(resumeText, 3000)}

JOB DESCRIPTION: ${sanitizeInput(jobDescription, 2000)}

JSON only:`
}

// ─── HELPER ─────────────────────────────────────────────────────────────────

function sanitizeInput(text: string, maxLength: number): string {
  return text
    .replace(/```/g, '')
    .replace(/\[SYSTEM\]/gi, '[SYS]')
    .replace(/\[INST\]/gi, '[INS]')
    .replace(/ignore previous instructions/gi, '')
    .replace(/you are now/gi, '')
    .substring(0, maxLength)
    .trim()
}
