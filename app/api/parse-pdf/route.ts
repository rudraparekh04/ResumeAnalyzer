// app/api/parse-pdf/route.ts
import { parseResume, getFileType, validateFile } from '@/lib/parser'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const validation = validateFile(file)
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileType = getFileType(file.name)

    const parsed = await parseResume(buffer, fileType)

    return Response.json(parsed)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}