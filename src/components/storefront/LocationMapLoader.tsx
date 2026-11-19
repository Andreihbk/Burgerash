"use client";

import dynamic from "next/dynamic";

// Leaflet needs the browser: load it client-side only.
const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[320px] bg-[#332420]/10" aria-hidden />,
});

export default function LocationMapLoader() {
  return <LocationMap />;
}
