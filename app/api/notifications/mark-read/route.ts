import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'not_configured' }, { status: 503 })
    }

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({})) as { ids?: string[] }
    const ids = Array.isArray(body?.ids) ? body.ids.filter((x) => typeof x === 'string') : []
    if (!ids.length) return NextResponse.json({ error: 'invalid_request' }, { status: 400 })

    const supabase = createClient(supabaseUrl as string, anonKey as string, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, detectSessionInUrl: false },
    })

    // RLS will ensure we can update only rows where user_id = auth.uid()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', ids)

    if (error) {
      console.error('notifications mark-read error:', error)
      return NextResponse.json({ error: 'db_error' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e) {
    console.error('notifications mark-read handler error:', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
