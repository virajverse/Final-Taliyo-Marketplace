import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const ALLOWED_ORIGINS = new Set([
  'https://app.taliyotechnologies.com',
  'https://taliyotechnologies.com',
  'https://www.taliyotechnologies.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://final-taliyo-marketplace-admin-pane.vercel.app',
]);

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get('origin') || '';
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { headers: corsHeaders(req) });
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return Response.json(
        { error: 'Server not configured' },
        { status: 500, headers: corsHeaders(req) },
      );
    }

    const { device_id, user_id, user_email } = await req.json();
    if (!device_id || !user_id) {
      return Response.json(
        { error: 'device_id and user_id required' },
        { status: 400, headers: corsHeaders(req) },
      );
    }

    const updates = { user_id, user_email: user_email || null };

    const [a, b] = await Promise.all([
      supabaseAdmin
        .from('pwa_installs')
        .update(updates)
        .eq('device_id', device_id)
        .is('user_id', null),
      supabaseAdmin
        .from('pwa_install_events')
        .update(updates)
        .eq('device_id', device_id)
        .is('user_id', null),
    ]);

    if (a.error) throw a.error;
    if (b.error) throw b.error;

    return Response.json(
      { ok: true, updated_installs: a.count || null, updated_events: b.count || null },
      { headers: corsHeaders(req) },
    );
  } catch (e: any) {
    return Response.json(
      { error: e?.message || 'Unknown error' },
      { status: 500, headers: corsHeaders(req) },
    );
  }
}
