// lib/parser.ts
import type { ParsedResume, FileType } from '@/types'

export async function parseResume(buffer: Buffer, fileType: FileType): Promise<ParsedResume> {
  let text = ''

  if (fileType === 'pdf') {
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)
    text = data.text
  } else {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    text = result.value
  }

  if (!text || text.trim().length < 30) {
    throw new Error(
      'Could not extract readable text. Ensure the file is not password-protected, scanned, or corrupted.'
    )
  }

  const cleaned = cleanText(text)
  return {
    text: cleaned,
    wordCount: cleaned.split(/\s+/).filter(Boolean).length,
    sections: detectSections(cleaned),
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function detectSections(text: string): ParsedResume['sections'] {
  const t = text.toLowerCase()
  return {
    hasObjective: /\b(objective|summary|profile|about me|professional summary)\b/.test(t),
    hasExperience: /\b(experience|employment|work history|career history|positions)\b/.test(t),
    hasEducation: /\b(education|university|college|degree|bachelor|master|phd|diploma)\b/.test(t),
    hasSkills: /\b(skills|technologies|tools|competencies|expertise|proficiencies)\b/.test(t),
    hasCertifications: /\b(certification|certificate|certified|license|credential)\b/.test(t),
  }
}

export function validateFile(file: {
  size: number
  type?: string
  name: string
}): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc']
  const ALLOWED_MIME = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ]

  if (file.size > MAX_SIZE) return { valid: false, error: 'File must be under 5MB' }

  const ext = `.${file.name.split('.').pop()?.toLowerCase()}`
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: 'Only PDF and DOCX files are accepted' }
  }
  if (file.type && !ALLOWED_MIME.includes(file.type)) {
    return { valid: false, error: 'Invalid file MIME type' }
  }

  return { valid: true }
}

export function getFileType(filename: string): FileType {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx' || ext === 'doc') return 'docx'
  throw new Error('Unsupported file format. Use PDF or DOCX.')
}

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
