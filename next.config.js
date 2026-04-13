/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '6mb' },
     serverComponentsExternalPackages: [
      "@prisma/client",
      "@prisma/extension-accelerate"
    ]
  },
}

module.exports = nextConfig
