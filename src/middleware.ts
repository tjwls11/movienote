import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    // 보호하고 싶은 다른 경로들 추가
  ],
}
