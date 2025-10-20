import 'server-only'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!url || !anon) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabaseServer = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
})
