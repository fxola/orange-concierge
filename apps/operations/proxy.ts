import { NextRequest, NextResponse } from 'next/server';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function proxy(request: NextRequest) {
  const { pathname, origin: requestOrigin } = request.nextUrl;

  //Better Auth handles its own endpoints.
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/') && MUTATION_METHODS.has(request.method)) {
    const origin = request.headers.get('origin');

    if (!origin || origin !== requestOrigin) {
      return NextResponse.json({ error: 'invalid_origin' }, { status: 403 });
    }

    const fetchSite = request.headers.get('sec-fetch-site');

    if (fetchSite && fetchSite !== 'same-origin') {
      return NextResponse.json({ error: 'invalid_origin' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
