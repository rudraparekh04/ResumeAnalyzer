export function extractBullets(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 25 && l.length < 400)
    .filter((l) => /^[•\-*▪➤➢►]/.test(l) || /^[A-Z][a-z]/.test(l))
    .map((l) => l.replace(/^[•\-*▪➤➢►]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 15)
}