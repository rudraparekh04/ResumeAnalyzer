// lib/groq.ts
import Groq from 'groq-sdk'

let _groq: Groq | null = null

function getGroq(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is not set')
  }
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _groq
}

export const GROQ_MODEL = 'llama-3.3-70b-versatile'

export async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 2048
): Promise<string> {
  const groq = getGroq()
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: maxTokens,
      temperature: 0.1, // near-deterministic for structured output
      top_p: 0.9,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })
    return completion.choices[0]?.message?.content ?? ''
  } catch (err: any) {
    if (err?.status === 429) throw new Error('AI rate limit reached. Please wait a moment.')
    if (err?.status === 503) throw new Error('AI service temporarily unavailable.')
    throw new Error(`AI call failed: ${err?.message ?? 'Unknown error'}`)
  }
}

export function parseJsonResponse<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Attempt to extract first JSON object/array
    const objMatch = cleaned.match(/\{[\s\S]*\}/)
    const arrMatch = cleaned.match(/\[[\s\S]*\]/)
    const match = objMatch ?? arrMatch
    if (match) return JSON.parse(match[0]) as T
    throw new Error('AI returned invalid JSON. Please try again.')
  }
}
