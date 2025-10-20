import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { isDisposableEmail } from '@/lib/disposableEmail'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
    if (!token || token !== (process.env.ADMIN_API_TOKEN || '')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: 'Admin client not configured' }, { status: 500 })
    }

    let page = 1
    const perPage = 1000
    let totalChecked = 0
    let totalBlocked = 0

    while (true) {
      const { data, error } = await (supabaseAdmin as any).auth.admin.listUsers({ page, perPage })
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
      const users = data?.users || []
      if (!users.length) break

      for (const u of users) {
        totalChecked++
        const email = (u.email || '').toLowerCase()
        if (!email) continue
        const disposable = await isDisposableEmail(email)
        if (!disposable) continue
        // mark as blocked in app_metadata
        const currentMeta = (u.app_metadata || {}) as Record<string, any>
        if (currentMeta.blocked === true) continue
        const { error: updErr } = await (supabaseAdmin as any).auth.admin.updateUserById(u.id, {
          app_metadata: { ...currentMeta, blocked: true },
        })
        if (!updErr) totalBlocked++
      }

      if (users.length < perPage) break
      page++
    }

    return NextResponse.json({ ok: true, checked: totalChecked, blocked: totalBlocked })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Unexpected error' }, { status: 500 })
  }
}
