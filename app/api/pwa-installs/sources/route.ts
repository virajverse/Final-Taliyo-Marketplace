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

function labelFor(e: any) {
  const us = e.utm_source?.trim()
  if (us) return us
  const rf = (e.ref || '').trim()
  if (rf) {
    try {
      const u = new URL(rf)
      return u.hostname || rf
    } catch {
      return rf
    }
  }
  return '(direct)'
}

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return Response.json({ error: 'Server not configured' }, { status: 500, headers: corsHeaders(req) })
    }

    const { searchParams } = new URL(req.url)
    const to = searchParams.get('to') || new Date().toISOString()
    const from = searchParams.get('from') || new Date(Date.now() - 30*24*60*60*1000).toISOString()

    const [eventsRes, installsRes] = await Promise.all([
      supabaseAdmin
        .from('pwa_install_events')
        .select('*')
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: true })
        .limit(20000),
      supabaseAdmin
        .from('pwa_installs')
        .select('device_id, created_at')
        .eq('event', 'first_open')
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: true })
        .limit(20000),
    ])

    if (eventsRes.error) throw eventsRes.error
    if (installsRes.error) throw installsRes.error

    // Most recent label per device in window
    const deviceLabel = new Map<string, string>()
    for (const e of eventsRes.data || []) {
      const label = labelFor(e)
      deviceLabel.set((e as any).device_id, label)
    }

    // Distinct devices per label that interacted (any event)
    const labelDevices = new Map<string, Set<string>>()
    for (const [dev, lab] of deviceLabel.entries()) {
      if (!labelDevices.has(lab)) labelDevices.set(lab, new Set<string>())
      labelDevices.get(lab)!.add(dev)
    }

    // Installs mapped to last-known label, else '(unknown)'
    const agg = new Map<string, { devices: number, installs: number }>()
    const ensure = (lab: string) => {
      if (!agg.has(lab)) agg.set(lab, { devices: 0, installs: 0 })
      return agg.get(lab)!
    }

    for (const [lab, set] of labelDevices.entries()) {
      ensure(lab).devices += set.size
    }

    for (const r of installsRes.data || []) {
      const dev = (r as any).device_id as string
      const lab = deviceLabel.get(dev) || '(unknown)'
      ensure(lab).installs += 1
    }

    // Format rows and sort by installs desc
    const rows = Array.from(agg.entries()).map(([label, v]) => ({
      label,
      devices: v.devices,
      installs: v.installs,
      conversion: v.devices ? Math.round((v.installs / v.devices) * 100) : 0,
    }))
    rows.sort((a, b) => (b.installs - a.installs) || (b.devices - a.devices))

    return Response.json({ from, to, rows: rows.slice(0, 20) }, { headers: corsHeaders(req) })
  } catch (e: any) {
    return Response.json({ error: e?.message || 'Unknown error' }, { status: 500, headers: corsHeaders(req) })
  }
}
