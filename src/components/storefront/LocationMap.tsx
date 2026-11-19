"use client";

import { useEffect, useRef, useState } from "react";
import type { Circle, Map as LeafletMap } from "leaflet";
import { DELIVERY_RADIUS_KM, SITE_COORDS } from "@/lib/site";

// TEMPORARY: radius slider is only for tuning the circle locally (NEXT_PUBLIC_FONT_PREVIEW=true).
const SHOW_SLIDER = process.env.NEXT_PUBLIC_FONT_PREVIEW === "true";

const PIN_HTML = `<svg viewBox="0 0 32 42" width="32" height="42" aria-hidden="true"><path d="M16 2C8.8 2 3 7.6 3 14.6 3 24 16 40 16 40s13-16 13-25.4C29 7.6 23.2 2 16 2Z" fill="#790D20" stroke="#332420" stroke-width="2.5"/><circle cx="16" cy="14.5" r="5" fill="#F5E6CC"/></svg>`;

export default function LocationMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const circleRef = useRef<Circle | null>(null);
  const [radiusKm, setRadiusKm] = useState(DELIVERY_RADIUS_KM);
  const radiusRef = useRef(radiusKm);

  // Create the map once (Leaflet touches `window`, so it is imported inside the effect).
  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;
    let observer: ResizeObserver | null = null;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;
      const center: [number, number] = [SITE_COORDS.lat, SITE_COORDS.lng];
      map = L.map(containerRef.current, { scrollWheelZoom: false, dragging: !L.Browser.mobile, zoomControl: true }).setView(center, 15);
      // CARTO Voyager raster tiles (no key). OSM's own tile servers 403 under their usage policy.
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(map);
      // Warm/cream brand tint on the tiles only; pin (markerPane) and radius (overlayPane) stay unfiltered.
      map.getPane("tilePane")!.style.filter = "sepia(0.35) saturate(0.8) hue-rotate(-10deg)";
      // No scroll hijack: wheel zoom turns on after a click on the map, off again when the pointer leaves.
      const wheelMap = map;
      map.on("click", () => wheelMap.scrollWheelZoom.enable());
      map.on("mouseout", () => wheelMap.scrollWheelZoom.disable());
      L.marker(center, {
        icon: L.divIcon({ html: PIN_HTML, className: "", iconSize: [32, 42], iconAnchor: [16, 40] }),
        title: "Burgerash",
        keyboard: false,
      }).addTo(map);
      const circle = L.circle(center, {
        radius: radiusRef.current * 1000,
        color: "#790D20",
        weight: 3,
        fillColor: "#790D20",
        fillOpacity: 0.15,
      }).addTo(map);
      circleRef.current = circle;
      map.fitBounds(circle.getBounds(), { padding: [16, 16] });
      mapRef.current = map;
      // Leaflet measures the container once; re-measure whenever it changes size (late CSS, grid reflow),
      // otherwise the map can stay grey with no tiles requested.
      const m = map;
      observer = new ResizeObserver(() => m.invalidateSize());
      observer.observe(containerRef.current);
    })();
    return () => {
      cancelled = true;
      observer?.disconnect();
      map?.remove();
      mapRef.current = null;
      circleRef.current = null;
    };
  }, []);

  const onRadius = (km: number) => {
    setRadiusKm(km);
    radiusRef.current = km;
    const circle = circleRef.current;
    if (!circle || !mapRef.current) return;
    circle.setRadius(km * 1000);
    mapRef.current.fitBounds(circle.getBounds(), { padding: [16, 16] });
  };

  return (
    <div className="relative h-[320px] md:h-full md:min-h-[320px]">
      <div ref={containerRef} className="absolute inset-0" role="img" aria-label="Hartă: locația Burgerash și zona de livrare" />
      {SHOW_SLIDER && (
        <label className="absolute bottom-6 left-3 right-3 sm:right-auto sm:w-64 z-[1000] bg-[#F5E6CC] border-2 border-[#332420] rounded-lg px-3 py-2 font-mono text-xs font-bold text-[#332420]">
          Rază livrare: {radiusKm.toFixed(1)} km
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={radiusKm}
            onChange={(e) => onRadius(Number(e.target.value))}
            className="block w-full accent-[#790D20]"
          />
        </label>
      )}
    </div>
  );
}
