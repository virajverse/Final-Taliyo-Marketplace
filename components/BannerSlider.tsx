"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MessageCircle } from "lucide-react";

type Banner = {
  id: string;
  image_url?: string | null;
  video_url?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  cta_align?: 'left' | 'center' | 'right' | null;
  start_at?: string | null;
  end_at?: string | null;
  target?: 'all' | 'mobile' | 'desktop' | null;
  duration_ms?: number | null;
  overlay_opacity?: number | null;
  alt_text?: string | null;
  aria_label?: string | null;
};

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [active, setActive] = useState(0);
  const slides = useMemo(() => banners, [banners]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Read optional banner limit from site_settings
        let limit = 3;
        try {
          const { data: setting } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'home_banner_limit')
            .maybeSingle();
          const parsed = Number(setting?.value);
          if (!Number.isNaN(parsed) && parsed > 0) limit = parsed;
        } catch {}

        const { data } = await supabase
          .from("banners")
          .select("*")
          .eq("active", true)
          .order("sort_order", { ascending: true })
          .limit(limit);
        if (!mounted) return;
        if (data && data.length) {
          const now = Date.now();
          const isMobile = typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : true;
          const scheduled = (data as any[]).filter((b) => {
            const s = b.start_at ? Date.parse(b.start_at) : null;
            const e = b.end_at ? Date.parse(b.end_at) : null;
            if (s && now < s) return false;
            if (e && now > e) return false;
            const tgt = (b.target || 'all') as Banner['target'];
            if (tgt === 'mobile' && !isMobile) return false;
            if (tgt === 'desktop' && isMobile) return false;
            return true;
          });
          setBanners(scheduled as any);
        }
        else setBanners([
          { id: 'default-1', image_url: '', cta_text: '+91 7042523611', cta_url: 'https://wa.me/+917042523611', cta_align: 'center' }
        ]);
      } catch {
        setBanners([{ id: 'default-1', image_url: '', cta_text: '+91 7042523611', cta_url: 'https://wa.me/+917042523611', cta_align: 'center' }]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const ms = Math.max(1500, Number(slides[active]?.duration_ms || 4000));
    const id = setTimeout(() => setActive((i) => (i + 1) % slides.length), ms);
    return () => clearTimeout(id);
  }, [slides, active]);

  const impressedRef = useRef(new Set<string>());
  const clickedRef = useRef(new Set<string>());

  const track = async (id: string, type: 'impression' | 'click') => {
    try {
      await fetch('/api/banners/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type })
      });
    } catch {}
  };

  useEffect(() => {
    const current = slides[active];
    if (!current) return;
    if (!impressedRef.current.has(current.id)) {
      impressedRef.current.add(current.id);
      track(current.id, 'impression');
    }
  }, [active, slides]);

  const handleCTA = (banner?: Banner) => {
    if (!banner?.cta_url) return;
    if (!clickedRef.current.has(banner.id)) {
      clickedRef.current.add(banner.id);
      track(banner.id, 'click');
    }
    const url = banner.cta_url;
    if (url.startsWith("http")) window.open(url, "_blank");
    else window.location.href = url;
  };

  if (!slides.length) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl mb-6 h-40 sm:h-48">
      <div className="flex transition-transform duration-500 h-full" style={{ transform: `translateX(-${active * 100}%)` }}>
        {slides.map((b) => {
          const align = b.cta_align || 'center';
          const justify = align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';
          return (
            <div key={b.id} className="min-w-full h-full relative bg-gray-200">
              {b.video_url ? (
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  src={b.video_url || ''}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : b.image_url ? (
                <img src={b.image_url} alt="banner" className="absolute inset-0 w-full h-full object-cover" />
              ) : null}
              <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${Math.min(0.6, Math.max(0, Number(b.overlay_opacity ?? 0.1)))})` }} />
              {b.cta_text ? (
                <div className={`absolute inset-x-0 bottom-3 px-4 flex ${justify}`}>
                  <button
                    onClick={() => handleCTA(b)}
                    className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow"
                    aria-label={b.aria_label || b.cta_text || 'Open link'}
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    {b.cta_text}
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-5 bg-white" : "w-2 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
