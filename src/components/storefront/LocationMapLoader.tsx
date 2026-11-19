"use client";

import dynamic from "next/dynamic";
// Static import: the CSS ships with the page, not the lazy map chunk.
import "maplibre-gl/dist/maplibre-gl.css";

// MapLibre needs the browser: load it client-side only.
const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => <div className="h-[320px] md:h-full md:min-h-[420px] bg-[#332420]/10" aria-hidden />,
});

export default function LocationMapLoader() {
  return <LocationMap />;
}
