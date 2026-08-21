import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tasker-backend-vmmt.onrender.com';

/**
 * Shared logic to forward any request method to the backend
 */
async function forwardRequest(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join('/');
  const url = `${BACKEND_URL}/auth/${path}`;

  // Get refresh token from cookie (if any)
  const refreshToken = req.cookies.get('refresh_token')?.value;

  // Get authorization header (for access tokens)
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

  // Read body if present (for POST, PUT, PATCH)
  let body: any = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.json().catch(() => undefined);
  }

  const backendResponse = await fetch(url, {
    method: req.method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await backendResponse.json();

  const response = NextResponse.json(data, { status: backendResponse.status });

  // If backend sends a new refresh token, store it in a cookie on our domain
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
  if (path === 'logout' && req.method === 'POST') {
    response.cookies.delete('refresh_token');
  }

  return response;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  return forwardRequest(req, { params });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  return forwardRequest(req, { params });
}

// Optionally add PUT, PATCH, DELETE if needed
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  return forwardRequest(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  return forwardRequest(req, { params });
}
