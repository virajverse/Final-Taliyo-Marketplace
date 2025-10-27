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

function parseBrowser(ua: string) {
  const l = (ua || '').toLowerCase();
  if (/edg\//.test(l)) return 'edge';
  if (/chrome\//.test(l)) return 'chrome';
  if (/safari\//.test(l)) return 'safari';
  if (/firefox\//.test(l)) return 'firefox';
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

    // Get first_open events for platform breakdown window
    const { data: rows, error } = await supabaseAdmin
      .from('pwa_installs')
      .select('ua, platform, created_at')
      .eq('event', 'first_open')
      .gte('created_at', from)
      .lte('created_at', to)
      .limit(5000);

    if (error) throw error;

    const platformCounts: Record<string, number> = {
      android: 0,
      iphone: 0,
      ipad: 0,
      desktop: 0,
      other: 0,
    };
    const browserCounts: Record<string, number> = {
      chrome: 0,
      safari: 0,
      edge: 0,
      firefox: 0,
      other: 0,
    };

    for (const r of rows || []) {
      const p = parsePlatform(r.ua as any, r.platform as any);
      const b = parseBrowser(r.ua as any);
      platformCounts[p] = (platformCounts[p] || 0) + 1;
      browserCounts[b] = (browserCounts[b] || 0) + 1;
    }

    return Response.json(
      { from, to, platform: platformCounts, browser: browserCounts },
      { headers: corsHeaders(req) },
    );
  } catch (e: any) {
    return Response.json(
      { error: e?.message || 'Unknown error' },
      { status: 500, headers: corsHeaders(req) },
    );
  }
}
