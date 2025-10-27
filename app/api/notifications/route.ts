import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(req: Request) {
  try {
    if (!supabaseUrl || !anonKey) {
      return new Response(JSON.stringify({ error: 'not_configured' }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl as string, anonKey as string, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, detectSessionInUrl: false },
    });

    const { searchParams } = new URL(req.url);
    const limitRaw = parseInt(searchParams.get('limit') || '50');
    const limit = Math.max(1, Math.min(100, isNaN(limitRaw) ? 50 : limitRaw));

    const { data, error } = await supabase
      .from('notifications')
      .select('id,type,title,message,is_read,created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('notifications query error:', error);
      return new Response(JSON.stringify({ error: 'db_error' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ notifications: data || [] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    console.error('notifications handler error:', e);
    return new Response(JSON.stringify({ error: 'server_error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
