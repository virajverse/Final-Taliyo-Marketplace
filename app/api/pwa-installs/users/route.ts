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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { headers: corsHeaders(req) });
}

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return Response.json(
        { error: 'Server not configured' },
        { status: 500, headers: corsHeaders(req) },
      );
    }

    const { searchParams } = new URL(req.url);
    const nowIso = new Date().toISOString();
    const to = searchParams.get('to') || nowIso;
    const from =
      searchParams.get('from') || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const limitUsers = Math.min(Number(searchParams.get('limit_users') || '500'), 2000);

    // Fetch first_open events mapped to user_ids
    const { data: firstOpens, error: foErr } = await supabaseAdmin
      .from('pwa_installs')
      .select('user_id, user_email, created_at')
      .eq('event', 'first_open')
      .not('user_id', 'is', null)
      .gte('created_at', from)
      .lte('created_at', to)
      .order('created_at', { ascending: true });

    if (foErr) throw foErr;

    const byUser = new Map<
      string,
      { user_id: string; user_email: string | null; first_open_at: string }
    >();
    for (const r of firstOpens || []) {
      if (!r.user_id) continue;
      if (!byUser.has(r.user_id)) {
        byUser.set(r.user_id, {
          user_id: r.user_id,
          user_email: r.user_email || null,
          first_open_at: r.created_at,
        });
      }
    }

    // Fetch recent users (profiles) in window; fallback to top latest if window yields none
    let { data: profiles, error: pErr } = await supabaseAdmin
      .from('profiles')
      .select('id, name, phone, avatar_url, created_at')
      .gte('created_at', from)
      .lte('created_at', to)
      .order('created_at', { ascending: false })
      .limit(limitUsers);

    if (pErr) throw pErr;

    if (!profiles || profiles.length === 0) {
      const retry = await supabaseAdmin
        .from('profiles')
        .select('id, name, phone, avatar_url, created_at')
        .order('created_at', { ascending: false })
        .limit(limitUsers);
      profiles = retry.data || [];
    }

    const installed: Array<{
      id: string;
      name: string | null;
      phone: string | null;
      avatar_url: string | null;
      email: string | null;
      first_open_at: string;
    }> = [];
    const not_installed: Array<{
      id: string;
      name: string | null;
      phone: string | null;
      avatar_url: string | null;
      created_at: string;
    }> = [];

    const installedIds = new Set<string>();

    for (const p of profiles || []) {
      const m = p.id ? byUser.get(p.id) : undefined;
      if (m) {
        installed.push({
          id: p.id,
          name: p.name || null,
          phone: p.phone || null,
          avatar_url: p.avatar_url || null,
          email: m.user_email || null,
          first_open_at: m.first_open_at,
        });
        installedIds.add(p.id);
      }
    }

    for (const p of profiles || []) {
      if (!installedIds.has(p.id)) {
        not_installed.push({
          id: p.id,
          name: p.name || null,
          phone: p.phone || null,
          avatar_url: p.avatar_url || null,
          created_at: p.created_at,
        });
      }
    }

    return Response.json(
      {
        from,
        to,
        installed_count: installed.length,
        not_installed_count: not_installed.length,
        installed,
        not_installed,
      },
      { headers: corsHeaders(req) },
    );
  } catch (e: any) {
    return Response.json(
      { error: e?.message || 'Unknown error' },
      { status: 500, headers: corsHeaders(req) },
    );
  }
}
