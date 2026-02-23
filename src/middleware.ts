import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que no requieren autenticación
const PUBLIC_PATHS = ['/login', '/auth/update-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirigir raíz a login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Permitir rutas públicas sin redirección
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/', '/auth/:path*'],
};
