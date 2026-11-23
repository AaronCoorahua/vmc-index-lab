"use client";

import { useEffect, useRef, useState } from "react";

// Iframe dibujado a su tamaño de diseño y escalado al ancho disponible, como una imagen (igual que AdStrip del index).
export default function ScaledFrame({ src, w, h, title }: { src: string; w: number; h: number; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setCw(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="sf" style={{ aspectRatio: `${w} / ${h}` }}>
      {cw ? <iframe src={src} width={w} height={h} title={title} style={{ transform: `scale(${cw / w})` }} /> : null}
    </div>
  );
}
