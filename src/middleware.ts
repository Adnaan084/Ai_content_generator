import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = req.nextauth.url?.includes('/admin')
    const isAuthPage = req.nextauth.url?.includes('/auth')

    // Redirect logic for authenticated users trying to access auth pages
    if (token && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Admin route protection
    if (isAdmin && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes that don't require authentication
        const publicRoutes = [
          '/',
          '/login',
          '/signup',
          '/about',
          '/api/auth',
          '/auth/error',
          '/auth/verify-request',
          '/_next',
          '/favicon.ico',
        ]

        // Check if the current path is public
        const isPublicRoute = publicRoutes.some(route =>
          pathname.startsWith(route)
        )

        // If it's a public route, allow access
        if (isPublicRoute) {
          return true
        }

        // Protected routes require authentication
        const protectedRoutes = [
          '/dashboard',
          '/generator',
          '/history',
          '/profile',
          '/api/generate',
          '/api/history',
          '/api/analytics',
          '/api/user',
        ]

        const isProtectedRoute = protectedRoutes.some(route =>
          pathname.startsWith(route)
        )

        // If it's a protected route, check for token
        if (isProtectedRoute) {
          return !!token
        }

        // Default to allowing access
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}