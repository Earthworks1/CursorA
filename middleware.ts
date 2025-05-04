import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  
  // Log de la requête
  console.log(`[API Middleware] ${request.method} ${request.nextUrl.pathname}`);
  console.log('[API Middleware] Headers:', Object.fromEntries(requestHeaders.entries()));

  // Gestion des CORS
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Headers CORS
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  return response;
}

export const config = {
  matcher: '/api/:path*',
}; 