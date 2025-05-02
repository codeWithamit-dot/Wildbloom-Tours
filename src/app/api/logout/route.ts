import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));

  response.cookies.set('token', '', {
    path: '/',
    httpOnly: true,
    expires: new Date(0), // Expire the cookie immediately
  });

  return response;
}
