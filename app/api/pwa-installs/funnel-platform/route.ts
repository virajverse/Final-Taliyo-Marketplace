import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const ALLOWED_ORIGINS = new Set([
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

function parsePlatform(ua: string, platform: string) {
  const l = (ua || '').toLowerCase();
  if (/iphone/.test(l)) return 'iphone';
  if (/android/.test(l)) return 'android';
  if (/ipad|macintosh/.test(l) && 'ontouchstart' in (globalThis as any)) return 'ipad';
  if (/windows|macintosh|linux/.test(l)) return 'desktop';
  return 'other';
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
    const to = searchParams.get('to') || new Date().toISOString();
    const from =
      searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [eventsRes, appInstalledRes, firstOpenRes] = await Promise.all([
      supabaseAdmin
        .from('pwa_install_events')
        .select('type, ua, platform, created_at', { count: 'exact' })
        .in('type', ['bar_impression', 'ios_hint_impression', 'prompted'])
        .gte('created_at', from)
        .lte('created_at', to)
        .limit(10000),
      supabaseAdmin
        .from('pwa_installs')
        .select('ua, platform, created_at', { count: 'exact' })
        .eq('event', 'appinstalled')
        .gte('created_at', from)
        .lte('created_at', to)
        .limit(10000),
      supabaseAdmin
        .from('pwa_installs')
        .select('ua, platform, created_at', { count: 'exact' })
        .eq('event', 'first_open')
        .gte('created_at', from)
        .lte('created_at', to)
        .limit(10000),
    ]);

    if (eventsRes.error) throw eventsRes.error;
    if (appInstalledRes.error) throw appInstalledRes.error;
    if (firstOpenRes.error) throw firstOpenRes.error;

    const platforms = ['android', 'iphone', 'ipad', 'desktop', 'other'] as const;
    const agg: Record<
      (typeof platforms)[number],
      { impressions: number; prompted: number; accepted: number; first_open: number }
    > = {
      android: { impressions: 0, prompted: 0, accepted: 0, first_open: 0 },
      iphone: { impressions: 0, prompted: 0, accepted: 0, first_open: 0 },
      ipad: { impressions: 0, prompted: 0, accepted: 0, first_open: 0 },
      desktop: { impressions: 0, prompted: 0, accepted: 0, first_open: 0 },
      other: { impressions: 0, prompted: 0, accepted: 0, first_open: 0 },
    };

    for (const r of eventsRes.data || []) {
      const p = parsePlatform((r as any).ua, (r as any).platform);
      if ((r as any).type === 'prompted') agg[p].prompted++;
      else agg[p].impressions++;
    }
    for (const r of appInstalledRes.data || []) {
      const p = parsePlatform((r as any).ua, (r as any).platform);
      agg[p].accepted++;
    }
    for (const r of firstOpenRes.data || []) {
      const p = parsePlatform((r as any).ua, (r as any).platform);
      agg[p].first_open++;
    }

    return Response.json({ from, to, by_platform: agg }, { headers: corsHeaders(req) });
  } catch (e: any) {
    return Response.json(
      { error: e?.message || 'Unknown error' },
      { status: 500, headers: corsHeaders(req) },
    );
  }
}
