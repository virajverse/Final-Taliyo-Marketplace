import 'server-only'

let cached: { set: Set<string>; ts: number } | null = null
const TTL_MS = 24 * 60 * 60 * 1000 // 24h

const STATIC_FALLBACK = [
  'tempmail.com','10minutemail.com','guerrillamail.com','sharklasers.com','mailinator.com','yopmail.com','trashmail.com','discard.email','getnada.com','nada.ltd','maildrop.cc','mintemail.com','spambog.com','moakt.com','fakeinbox.com','temporary-mail.net','temp-mail.io','mytemp.email','emailondeck.com','throwawaymail.com','inboxkitten.com','mail7.io','tmails.net','tmpmail.org','dispostable.com','harakirimail.com','spambox.org','spamgourmet.com','mailcatch.com','mailsac.com','mail-temporaire.fr','fakemailgenerator.com','inboxbear.com','dropmail.me'
]

const DEFAULT_SOURCES = (
  [
    process.env.DISPOSABLE_DOMAINS_URL,
    'https://raw.githubusercontent.com/ivolo/disposable-email-domains/master/index.json',
    'https://raw.githubusercontent.com/andreis/disposable/master/domains.txt',
  ].filter(Boolean) as string[]
)

async function loadFromUrl(url: string): Promise<string[]> {
  const res = await fetch(url, { next: { revalidate: 60 * 60 } })
  if (!res.ok) throw new Error('source fetch failed')
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    const arr = await res.json()
    if (Array.isArray(arr)) return arr.map((s: any) => String(s).toLowerCase())
    return []
  }
  const text = await res.text()
  return text.split(/\r?\n/).map(s => s.trim().toLowerCase()).filter(Boolean)
}

function withExtras(set: Set<string>): Set<string> {
  const extra = (process.env.DISPOSABLE_DOMAINS_EXTRA || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
  for (const d of extra) set.add(d)
  return set
}

export async function getDisposableDomains(): Promise<Set<string>> {
  const now = Date.now()
  if (cached && (now - cached.ts) < TTL_MS) return cached.set

  const out = new Set<string>(STATIC_FALLBACK.map(d => d.toLowerCase()))
  for (const url of DEFAULT_SOURCES) {
    try {
      const list = await loadFromUrl(url)
      for (const d of list) out.add(d)
    } catch {}
  }
  cached = { set: withExtras(out), ts: Date.now() }
  return cached.set
}

export async function isDisposableEmail(email: string): Promise<boolean> {
  const domain = email.split('@')[1]?.toLowerCase() || ''
  if (!domain) return true
  const set = await getDisposableDomains()
  if (set.has(domain)) return true
  for (const d of set) {
    if (domain.endsWith('.' + d)) return true
  }
  return false
}
