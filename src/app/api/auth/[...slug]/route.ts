import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:3001/';

async function forwardRequest(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = slug.join('/');
  const url = `${BACKEND_URL}/auth/${path}`;

  const refreshToken = req.cookies.get('refresh_token')?.value;
  const authHeader = req.headers.get('authorization');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (refreshToken) {
    headers.Cookie = `refresh_token=${refreshToken}`;
  }
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  let body: any = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      body = await req.json();
    } catch {
      // ignore
    }
  }

  const backendResponse = await fetch(url, {
    method: req.method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await backendResponse.json();
  } catch {
    data = {};
  }

  const response = NextResponse.json(data, { status: backendResponse.status });

  if (data.refreshToken) {
    response.cookies.set('refresh_token', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
  }

  if (path === 'logout' && req.method === 'POST') {
    response.cookies.delete('refresh_token');
  }

  return response;
}

export const GET = forwardRequest;
export const POST = forwardRequest;
export const PUT = forwardRequest;
export const DELETE = forwardRequest;
export const PATCH = forwardRequest;
