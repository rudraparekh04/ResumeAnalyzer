// app/api/resume/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadResume } from '@/lib/cloudinary'
import { parseResume, validateFile, getFileType } from '@/lib/parser'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 30
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
})


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

  try {
  limiter.check(req, 10, `analyze:${session.user.id}`)
} catch {
  return NextResponse.json(
    { error: 'Analysis limit reached (10/hour). Please wait.' },
    { status: 429 }
  )
}
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const validation = validateFile({ size: file.size, type: file.type, name: file.name })
    if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileType = getFileType(file.name)
    const parsed = await parseResume(buffer, fileType)
    const { url: fileUrl } = await uploadResume(buffer, file.name, session.user.id)

    const latest = await prisma.resume.findFirst({
      where: { userId: session.user.id },
      orderBy: { version: 'desc' },
      select: { version: true },
    })

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        fileName: `${Date.now()}-${file.name}`,
        originalName: file.name,
        fileUrl,
        fileType,
        parsedText: parsed.text,
        fileSize: file.size,
        version: (latest?.version ?? 0) + 1,
      },
    })

    return NextResponse.json({
      success: true,
      resumeId: resume.id,
      fileName: resume.originalName,
      wordCount: parsed.wordCount,
      sections: parsed.sections,
    })
  } catch (e: any) {
    console.error('[UPLOAD]', e)
    return NextResponse.json({ error: e.message ?? 'Upload failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id, isActive: true },
      include: {
        analyses: { select: { id: true, atsScore: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(resumes)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 })
  }
}
