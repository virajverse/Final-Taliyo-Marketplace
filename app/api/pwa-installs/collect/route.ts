import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const ALLOWED_ORIGINS = new Set([
  'https://app.taliyotechnologies.com',
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { headers: corsHeaders(req) })
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return Response.json({ error: 'Server not configured' }, { status: 500, headers: corsHeaders(req) })
    }

    const body = await req.json()
    const {
      device_id,
      event,
      type,
      ua,
      platform,
      lang,
      utm_source,
      utm_medium,
      utm_campaign,
      ref,
      source,
      user_id,
      user_email,
    } = body || {}

    if (!device_id) {
      return Response.json({ error: 'device_id required' }, { status: 400, headers: corsHeaders(req) })
    }

    const userAgent = ua || req.headers.get('user-agent') || ''

    if (event) {
      const { error } = await supabaseAdmin
        .from('pwa_installs')
        .insert([{
          device_id,
          event,
          ua: userAgent,
          platform: platform || null,
          lang: lang || null,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          ref: ref || null,
          source: source || null,
          user_id: user_id || null,
          user_email: user_email || null,
        }])
      if (error) throw error
    }

    if (type) {
      const { error } = await supabaseAdmin
        .from('pwa_install_events')
        .insert([{
          device_id,
          type,
          ua: userAgent,
          platform: platform || null,
          lang: lang || null,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          ref: ref || null,
          user_id: user_id || null,
          user_email: user_email || null,
        }])
      if (error) throw error
    }

    if (!event && !type) {
      return Response.json({ error: 'event or type required' }, { status: 400, headers: corsHeaders(req) })
    }

    return Response.json({ ok: true }, { headers: corsHeaders(req) })
  } catch (e: any) {
    return Response.json({ error: e?.message || 'Unknown error' }, { status: 500, headers: corsHeaders(req) })
  }
}
