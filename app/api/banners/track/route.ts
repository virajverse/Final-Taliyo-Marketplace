import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { id, type } = await req.json();
    if (!id || (type !== 'impression' && type !== 'click')) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { ok: false, error: 'Supabase env not configured' },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    const { error } = await supabase.from('banner_events').insert({
      banner_id: id,
      event_type: type,
      ip_address: ip,
      user_agent: userAgent,
    });

    if (error) {
      // Do not break the page if logging fails; return 200 but note the error
      return NextResponse.json({ ok: true, logged: false });
    }

    return NextResponse.json({ ok: true, logged: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
