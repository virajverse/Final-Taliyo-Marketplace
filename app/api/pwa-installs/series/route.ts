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

function eachDay(fromISO: string, toISO: string) {
  const out: string[] = [];
  const from = new Date(fromISO);
  const to = new Date(toISO);
  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    out.push(new Date(d).toISOString().slice(0, 10));
  }
  return out;
}

function dayKey(ts: string) {
  return ts.slice(0, 10);
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

    const [firstOpenRes, appInstalledRes] = await Promise.all([
      supabaseAdmin
        .from('pwa_installs')
        .select('created_at', { count: 'exact' })
        .eq('event', 'first_open')
        .gte('created_at', from)
        .lte('created_at', to)
        .limit(5000),
      supabaseAdmin
        .from('pwa_installs')
        .select('created_at', { count: 'exact' })
        .eq('event', 'appinstalled')
        .gte('created_at', from)
        .lte('created_at', to)
        .limit(5000),
    ]);

    if (firstOpenRes.error) throw firstOpenRes.error;
    if (appInstalledRes.error) throw appInstalledRes.error;

    const days = eachDay(from, to);
    const seriesFirst: Record<string, number> = {};
    const seriesInstall: Record<string, number> = {};
    days.forEach((d) => {
      seriesFirst[d] = 0;
      seriesInstall[d] = 0;
    });

    for (const r of firstOpenRes.data || []) {
      const k = dayKey((r as any).created_at);
      if (k in seriesFirst) seriesFirst[k]++;
    }
    for (const r of appInstalledRes.data || []) {
      const k = dayKey((r as any).created_at);
      if (k in seriesInstall) seriesInstall[k]++;
    }

    const labels = days;
    const first_open = labels.map((d) => seriesFirst[d] || 0);
    const appinstalled = labels.map((d) => seriesInstall[d] || 0);

    return Response.json(
      { from, to, labels, first_open, appinstalled },
      { headers: corsHeaders(req) },
    );
  } catch (e: any) {
    return Response.json(
      { error: e?.message || 'Unknown error' },
      { status: 500, headers: corsHeaders(req) },
    );
  }
}
