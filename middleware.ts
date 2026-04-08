// middleware.ts
export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/upload/:path*',
    '/analysis/:path*',
    '/compare/:path*',
  ],
}
