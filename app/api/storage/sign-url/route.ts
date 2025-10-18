import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return NextResponse.json({ error: 'not_configured' }, { status: 503 })
    }

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({})) as { bookingId?: string; path?: string; expiresIn?: number }
    const bookingId = String(body?.bookingId || '')
    const path = String(body?.path || '')
    const expiresIn = Math.max(60, Math.min(Number(body?.expiresIn || 900), 3600))

    if (!bookingId || !path) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
    }

    // RLS check: ensure the booking exists and contains this file path for this user
    const sbUser = createClient(supabaseUrl as string, anonKey as string, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, detectSessionInUrl: false },
    })

    const { data: booking, error } = await sbUser
      .from('bookings')
      .select('id, files')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    const files = Array.isArray((booking as any).files) ? (booking as any).files : []
    const hasFile = files.some((f: any) => f && typeof f.path === 'string' && f.path === path)
    if (!hasFile) {
      return NextResponse.json({ error: 'file_not_found' }, { status: 404 })
    }

    // Generate signed URL using service role
    const sbSrv = createClient(supabaseUrl as string, serviceKey as string)
    const { data: signed, error: signErr } = await sbSrv
      .storage
      .from('booking-files')
      .createSignedUrl(path, expiresIn)

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json({ error: 'sign_error' }, { status: 500 })
    }

    return NextResponse.json({ url: signed.signedUrl }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
