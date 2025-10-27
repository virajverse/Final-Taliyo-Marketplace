import { NextResponse } from 'next/server';
import { isDisposableEmail } from '@/lib/disposableEmail';

const rlWindowMs = 10 * 60 * 1000; // 10 minutes
const rlMax = 30;
const rlMap = new Map<string, number[]>();

function getClientIp(req: Request): string {
  try {
    // @ts-ignore
    const hdrs = (req as any).headers;
    const fwd = (hdrs.get('x-forwarded-for') || '').split(',')[0].trim();
    return fwd || hdrs.get('x-real-ip') || '' || 'unknown';
  } catch {
    return 'unknown';
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = rlMap.get(ip) || [];
  const filtered = arr.filter((ts) => now - ts < rlWindowMs);
  filtered.push(now);
  rlMap.set(ip, filtered);
  return filtered.length > rlMax;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const { email } = await req.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }
    const disposable = await isDisposableEmail(email);
    return NextResponse.json({ ok: true, disposable });
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
