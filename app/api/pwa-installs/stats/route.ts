import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const ALLOWED_ORIGINS = new Set([
  'https://taliyotechnologies.com',
  'https://www.taliyotechnologies.com',
  'http://localhost:5173',
  'http://localhost:3000',
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

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Total unique devices (proxy: count of first_open rows)
    const totalFirstOpen = await supabaseAdmin
      .from('pwa_installs')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'first_open')

    const last30FirstOpen = await supabaseAdmin
      .from('pwa_installs')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'first_open')
      .gte('created_at', since)

    // Appinstalled events (not unique, informational)
    const totalAppInstalled = await supabaseAdmin
      .from('pwa_installs')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'appinstalled')

    const last30AppInstalled = await supabaseAdmin
      .from('pwa_installs')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'appinstalled')
      .gte('created_at', since)

    const body = {
      devices_total: totalFirstOpen.count || 0,
      devices_last_30d: last30FirstOpen.count || 0,
      installs_total: totalAppInstalled.count || 0,
      installs_last_30d: last30AppInstalled.count || 0,
      since_utc: since,
    }

    return Response.json(body, { headers: corsHeaders(req) })
  } catch (e: any) {
    return Response.json({ error: e?.message || 'Unknown error' }, { status: 500, headers: corsHeaders(req) })
  }
}
