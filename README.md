# Pyramid Frontend

A modern Next.js 15 application for task and project management, featuring Google OAuth and guest authentication.

## Authentication Flow

The frontend relies on **httpOnly refresh tokens** stored as cookies on the frontend domain. The login flow:

1. User logs in via Google or Guest → the Next.js API route (`/api/auth/[...slug]`) forwards credentials to the backend.
2. Backend returns `accessToken` and `refreshToken` in the JSON body.
3. The API route sets a secure, `httpOnly` `refresh_token` cookie on the frontend domain (conditional `secure` flag for local HTTP).
4. The access token is stored in memory and attached to subsequent API calls via Axios interceptors.
5. On page reload, the `AuthProvider` calls `/api/auth/refresh`; the cookie is sent, backend returns new tokens, and the session persists.
6. Logout clears the cookie.

## Key Features

- Google OAuth 2.0 with `@react-oauth/google`
- Guest accounts (auto‑expire after 1 hour)
- DnD task boards (using `@dnd-kit`)
- Comments with reactions, pinning, and mentions
- File uploads (Cloudinary) and link attachments
- Dark/light theme + color mode preferences

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_API_URL` – Backend URL (e.g., `https://your-backend.onrender.com`)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` – Google OAuth client ID
- (Optional) `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` for avatar uploads

Run development:
```bash
npm run dev
```

## Environment

The frontend is deployed on Vercel; the backend runs on Render. The API route acts as a proxy, forwarding requests and managing the refresh token cookie.
