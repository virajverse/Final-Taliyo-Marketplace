'use server';

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/orders', '/wishlist', '/reviews', '/order-status', '/notifications', '/profile', '/settings']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (!isProtected) return NextResponse.next()

  const hasAuthCookie = req.cookies.get('taliyo_auth')?.value === '1'
  if (hasAuthCookie) return NextResponse.next()

  const loginUrl = new URL('/login', req.url)
  const nextWithQuery = pathname + (req.nextUrl.search || '')
  loginUrl.searchParams.set('next', nextWithQuery)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    '/orders/:path*',
    '/wishlist/:path*',
    '/reviews/:path*',
    '/order-status/:path*',
    '/notifications/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
}
