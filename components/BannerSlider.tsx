"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MessageCircle } from "lucide-react";

type Banner = {
  id: string;
  image_url?: string | null;
  video_url?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  cta_align?: 'left' | 'center' | 'right' | null;
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
          .select("id,image_url,video_url,cta_text,cta_url,cta_align")
          .eq("active", true)
          .order("sort_order", { ascending: true })
          .limit(limit);
        if (!mounted) return;
        if (data && data.length) setBanners(data as any);
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
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [slides.length]);

  const handleCTA = (url?: string | null) => {
    if (!url) return;
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
              <div className="absolute inset-0 bg-black/10" />
              {b.cta_text ? (
                <div className={`absolute inset-x-0 bottom-3 px-4 flex ${justify}`}>
                  <button
                    onClick={() => handleCTA(b.cta_url)}
                    className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow"
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
