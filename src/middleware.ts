import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/', '/setup/admin', '/auth-test', '/session-test', '/dashboard', '/admin'];
  
  // If it's a public route, allow access
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/')) {
    return response;
  }

  // Create Supabase client for server-side auth check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    // TEMPORARILY DISABLED FOR DEBUGGING
    // Uncomment after fixing SQL migration and session issues
    
    /*
    // Check if accessing admin routes
    if (pathname.startsWith('/admin')) {
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('Middleware admin check - User:', user?.id, 'Path:', pathname);
      
      if (!user) {
        console.log('No user found, redirecting to login');
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Get user profile to check role
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      console.log('User profile:', profile);

      if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        console.log('User not admin, redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // For dashboard routes, just check if user is authenticated
    if (pathname.startsWith('/dashboard')) {
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('Middleware dashboard check - User:', user?.id, 'Path:', pathname);
      
      if (!user) {
        console.log('No user found for dashboard, redirecting to login');
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
    */
  } catch (error) {
    // If there's an error checking auth, redirect to login
    console.error('Middleware error:', error, 'Path:', pathname);
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return response;
}

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
};
