// app/api/auth/[...slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:3000';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const path = params.slug.join('/'); // e.g., 'google', 'guest', 'refresh', 'logout'
  const url = `${BACKEND_URL}/auth/${path}`;

  // Read refresh token from the cookie (same domain)
  const refreshToken = req.cookies.get('refresh_token')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (refreshToken) {
    headers.Cookie = `refresh_token=${refreshToken}`;
  }

  const body = req.method === 'POST' ? await req.json() : undefined;

  const backendResponse = await fetch(url, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await backendResponse.json();

  const response = NextResponse.json(data, { status: backendResponse.status });

  // If the backend sends a new refresh token, store it in a cookie on our domain
  if (data.refreshToken) {
    response.cookies.set('refresh_token', data.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
  }

  // Clear cookie on logout
  if (path === 'logout') {
    response.cookies.delete('refresh_token');
  }

  return response;
}
