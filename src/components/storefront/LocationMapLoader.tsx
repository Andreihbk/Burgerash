"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
// Static import: the CSS ships with the page, not the lazy map chunk, so the map never flashes unstyled.
import "maplibre-gl/dist/maplibre-gl.css";

const PLACEHOLDER_CLASS = "h-[320px] md:h-full md:min-h-[420px] bg-[#332420]/10";

// MapLibre needs the browser: load it client-side only.
const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => <div className={PLACEHOLDER_CLASS} aria-hidden />,
});

// Start loading the map chunk (~290 KB gz) only when the section is this close to the viewport.
// Before that, the phone CPU is free for the hero and the menu (audit R1).
const PRELOAD_MARGIN = "600px 0px";

export default function LocationMapLoader() {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = placeholderRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: PRELOAD_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!near) return <div ref={placeholderRef} className={PLACEHOLDER_CLASS} aria-hidden />;
  return <LocationMap />;
}
