// app/api/resume/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const resume = await prisma.resume.findFirst({
      where: { id: params.id, userId: session.user.id },
    })
    if (!resume) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Soft delete
    await prisma.resume.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const resume = await prisma.resume.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: {
        analyses: { orderBy: { createdAt: 'desc' } },
        jobMatches: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })

    if (!resume) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(resume)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
