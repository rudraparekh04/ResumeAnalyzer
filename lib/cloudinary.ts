// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
})

export async function uploadResume(
  buffer: Buffer,
  filename: string,
  userId: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '-')
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: `resumeiq/resumes/${userId}`,
        public_id: `${Date.now()}-${safeFilename}`,
        tags: ['resume', userId],
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) reject(error ?? new Error('Cloudinary upload failed'))
        else resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    stream.end(buffer)
  })
}

export async function deleteResume(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
}
