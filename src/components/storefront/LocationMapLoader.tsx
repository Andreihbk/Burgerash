"use client";

import dynamic from "next/dynamic";
// Static import: the CSS ships with the page instead of the lazy map chunk, so it is in place before Leaflet measures.
import "leaflet/dist/leaflet.css";

// Leaflet needs the browser: load it client-side only.
const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => <div className="h-[320px] md:h-full md:min-h-[320px] bg-[#332420]/10" aria-hidden />,
});

export default function LocationMapLoader() {
  return <LocationMap />;
}
