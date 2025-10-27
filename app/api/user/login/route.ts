import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}) as any);
    const userId = body?.userId || null;
    const email = body?.email || null;
    const phone = body?.phone || null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'missing_env' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const userAgent = req.headers.get('user-agent') || '';
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';

    const { error } = await supabase.from('analytics').insert({
      event_type: 'user_login',
      event_data: { userId, email, phone },
      user_agent: userAgent,
      user_ip: ip,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
