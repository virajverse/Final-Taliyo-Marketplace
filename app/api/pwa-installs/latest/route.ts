import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const ALLOWED_ORIGINS = new Set([
  'https://taliyotechnologies.com',
  'https://www.taliyotechnologies.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://final-taliyo-marketplace-admin-pane.vercel.app',
])

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get('origin') || ''
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : ''
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { headers: corsHeaders(req) })
}

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return Response.json({ error: 'Server not configured' }, { status: 500, headers: corsHeaders(req) })
    }

    const { searchParams } = new URL(req.url)
    const to = searchParams.get('to') || new Date().toISOString()
    const from = searchParams.get('from') || new Date(Date.now() - 30*24*60*60*1000).toISOString()
    const limit = Math.min(Number(searchParams.get('limit') || '20'), 100)

    const { data, error } = await supabaseAdmin
      .from('pwa_installs')
      .select('device_id, ua, platform, lang, created_at')
      .eq('event', 'first_open')
      .gte('created_at', from)
      .lte('created_at', to)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return Response.json({ from, to, rows: data || [] }, { headers: corsHeaders(req) })
  } catch (e: any) {
    return Response.json({ error: e?.message || 'Unknown error' }, { status: 500, headers: corsHeaders(req) })
  }
}
