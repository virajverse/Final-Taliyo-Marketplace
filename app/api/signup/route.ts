import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isDisposableEmail } from '@/lib/disposableDomains';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, location, password } = body || {};

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (isDisposableEmail(email)) {
      return NextResponse.json({ error: 'Disposable/temporary emails are not allowed.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Use anon client for standard signUp (email confirmations, etc.)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone, location },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // After successful signup, upsert profile server-side using service role to bypass RLS
    const uid = data?.user?.id as string | undefined;
    if (uid) {
      if (!serviceRoleKey) {
        // If no service role is configured, still return success for signup but warn via payload
        return NextResponse.json({ success: true, data, warning: 'Profile not upserted (missing service role key)' }, { status: 200 });
      }
      const admin = createClient(supabaseUrl, serviceRoleKey);
      const avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
      const { error: upsertError } = await admin
        .from('profiles')
        .upsert({
          id: uid,
          name,
          phone,
          avatar_url: avatar,
          location: location || 'Location not set',
        });
      if (upsertError) {
        return NextResponse.json({ success: true, data, warning: 'Signup ok but profile not saved', details: upsertError.message }, { status: 200 });
      }
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
