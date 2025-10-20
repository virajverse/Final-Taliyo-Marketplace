import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { isDisposableEmail } from '@/lib/disposableEmail'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Simple in-memory rate limiting per IP: 10 requests / 10 minutes
const rlWindowMs = 10 * 60 * 1000
const rlMax = 10
const rlMap = new Map<string, number[]>()

function getClientIp(req: Request): string {
  try {
    // @ts-ignore
    const hdrs = (req as any).headers
    const fwd = (hdrs.get('x-forwarded-for') || '').split(',')[0].trim()
    return fwd || (hdrs.get('x-real-ip') || '') || 'unknown'
  } catch { return 'unknown' }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const arr = rlMap.get(ip) || []
  const filtered = arr.filter(ts => now - ts < rlWindowMs)
  filtered.push(now)
  rlMap.set(ip, filtered)
  return filtered.length > rlMax
}

export async function POST(req: Request) {
  try {
    if (!url || !anon) {
      return NextResponse.json({ ok: false, error: 'Server not configured' }, { status: 500 })
    }

    const ip = getClientIp(req)
    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
    }

    const { name, email, phone, password } = await req.json()

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
    }

    if (!email.includes('@')) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 })
    }

    if (await isDisposableEmail(email)) {
      return NextResponse.json({ ok: false, error: 'Disposable email not allowed' }, { status: 400 })
    }

    const origin = new URL(req.url).origin
    const sb = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

    const uid = data.user?.id
    if (uid) {
      const avatar = 'https://picsum.photos/seed/new-user/150/150'
      try {
        if (supabaseAdmin) {
          const { error: pErr } = await supabaseAdmin.from('profiles').upsert({ id: uid, name, phone, avatar_url: avatar })
          if (pErr) {
            // fallback to anon (may fail due to RLS if no session)
            await sb.from('profiles').upsert({ id: uid, name, phone, avatar_url: avatar })
          }
        } else {
          await sb.from('profiles').upsert({ id: uid, name, phone, avatar_url: avatar })
        }
      } catch {}
    }

    return NextResponse.json({ ok: true, message: 'Verification email sent. Please verify before signing in.' })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Unexpected error' }, { status: 500 })
  }
}
