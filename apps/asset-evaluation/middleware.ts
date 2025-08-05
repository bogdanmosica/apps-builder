import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';

const protectedRoutes = ['/dashboard'];

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get('session');
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));


    if (isProtectedRoute) {
      if (!sessionCookie) {
        console.log('❌ No session cookie, redirecting to sign-in for:', pathname);
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }

      // Check user role for protected routes
      try {
        const parsed = await verifyToken(sessionCookie.value);
        const userRole = parsed.user?.role || 'member';
        const isAdminUser = ['owner', 'admin'].includes(userRole);
        
        if (pathname === '/dashboard/property-types') {
          console.log('🔍 User role check for property-types:', {
            userRole,
            isAdminUser,
            userId: parsed.user?.id,
          });
        }
        
        if (!isAdminUser) {
          console.log('❌ User not admin, redirecting to home for:', pathname, 'Role:', userRole);
          // Redirect regular members to marketing page instead of protected routes
          return NextResponse.redirect(new URL('/', request.url));
        }
      } catch (error) {
        console.error('Error verifying token for role check:', error);
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }

    let res = NextResponse.next();

    if (sessionCookie && request.method === 'GET') {
      try {
        const parsed = await verifyToken(sessionCookie.value);
        const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

        res.cookies.set({
          name: 'session',
          value: await signToken({
            ...parsed,
            expires: expiresInOneDay.toISOString()
          }),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Only secure in production
          sameSite: 'lax',
          expires: expiresInOneDay,
          path: '/' // Ensure cookie is available site-wide
        });
      } catch (error) {
        console.error('Error updating session:', error);
        res.cookies.delete('session');
        if (isProtectedRoute) {
          return NextResponse.redirect(new URL('/sign-in', request.url));
        }
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // If middleware fails completely, allow the request to continue
    // This prevents the entire app from breaking due to middleware issues
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
