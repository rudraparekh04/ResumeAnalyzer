// types/index.ts

export interface AnalysisResult {
  atsScore: number
  strengths: string[]
  weaknesses: string[]
  missingKeywords: string[]
  improvements: string[]
  sectionFeedback: {
    summary: string
    experience: string
    skills: string
    education: string
    formatting: string
  }
  careerTips: string[]
}

export interface JobMatchResult {
  matchScore: number
  presentSkills: string[]
  missingSkills: string[]
  suggestions: string[]
  keywordsToAdd: string[]
  analysis: string
}

export interface BulletRewriteResult {
  original: string
  rewritten: string
  improvement: string
}

export interface KeywordOptimizeResult {
  highPriority: string[]
  mediumPriority: string[]
  lowPriority: string[]
  alreadyPresent: string[]
  placementSuggestions: {
    skills_section: string[]
    experience_section: string[]
    summary_section: string[]
  }
}

export type FileType = 'pdf' | 'docx'

export interface ParsedResume {
  text: string
  wordCount: number
  sections: {
    hasObjective: boolean
    hasExperience: boolean
    hasEducation: boolean
    hasSkills: boolean
    hasCertifications: boolean
  }
}

export interface ResumeWithAnalysis {
  id: string
  fileName: string
  originalName: string
  fileUrl: string
  fileSize: number
  version: number
  createdAt: Date
  analyses: {
    id: string
    atsScore: number
    createdAt: Date
  }[]
}

export interface DashboardStats {
  totalResumes: number
  totalAnalyses: number
  totalJobMatches: number
  averageScore: number
  bestScore: number
  latestScore: number | null
}
