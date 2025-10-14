import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { error: 'Supabase admin not configured' as const }
  const admin = createClient(url, key)
  return { admin }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('x-admin-token') || ''
    const expected = process.env.ADMIN_PANEL_TOKEN || ''
    if (!expected || token !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { name, email, phone, password } = body || {}
    if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 })
    const g = getAdminClient()
    if ('error' in g) return NextResponse.json({ error: g.error }, { status: 500 })
    const { admin } = g
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      phone,
      email_confirm: false,
      phone_confirm: false,
      user_metadata: { name, phone },
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const uid = data.user?.id
    if (uid) {
      const avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      await admin.from('profiles').upsert({ id: uid, name, phone, avatar_url: avatar })
    }
    return NextResponse.json({ success: true, user: data.user })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const token = request.headers.get('x-admin-token') || ''
    const expected = process.env.ADMIN_PANEL_TOKEN || ''
    if (!expected || token !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { id, email, phone, email_confirm, phone_confirm } = body || {}
    const g = getAdminClient()
    if ('error' in g) return NextResponse.json({ error: g.error }, { status: 500 })
    const { admin } = g

    let userId = id as string | undefined
    if (!userId && (email || phone)) {
      const { data, error } = await admin.auth.admin.listUsers()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      const users = data.users || []
      const match = users.find((u: any) => (email ? u.email === email : true) && (phone ? (u.phone || '') === phone : true))
      userId = match?.id
    }
    if (!userId) return NextResponse.json({ error: 'user not found' }, { status: 404 })

    const { data: updated, error: updErr } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: email_confirm === true,
      phone_confirm: phone_confirm === true,
    })
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 })

    return NextResponse.json({ success: true, user: updated.user })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('x-admin-token') || ''
    const expected = process.env.ADMIN_PANEL_TOKEN || ''
    if (!expected || token !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || ''
    const g = getAdminClient()
    if ('error' in g) return NextResponse.json({ error: g.error }, { status: 500 })
    const { admin } = g
    const { data, error } = await admin.auth.admin.listUsers()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const users = (data.users || []).filter((u: any) => {
      const h = `${u.id} ${u.email || ''} ${u.phone || ''}`.toLowerCase()
      return query ? h.includes(query.toLowerCase()) : true
    }).slice(0, 50)
    const out = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      email_confirmed_at: (u as any).email_confirmed_at,
      phone_confirmed_at: (u as any).phone_confirmed_at,
    }))
    return NextResponse.json({ users: out })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
