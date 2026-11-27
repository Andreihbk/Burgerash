"use client";

import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import { DELIVERY_RADIUS_KM, SITE_COORDS } from "@/lib/site";
import { BRAND_MAP_STYLE } from "./mapStyle";

// TEMPORARY: radius slider is only for tuning the circle locally (NEXT_PUBLIC_MAP_TUNING=true).
const SHOW_SLIDER = process.env.NEXT_PUBLIC_MAP_TUNING === "true";

const ATTRIBUTION = "© OpenFreeMap © OpenMapTiles © OpenStreetMap contributors";
const CIRCLE_POINTS = 64;
const BRAND = "#790D20";

const PIN_HTML = `<svg viewBox="0 0 32 42" width="32" height="42" aria-hidden="true"><path d="M16 2C8.8 2 3 7.6 3 14.6 3 24 16 40 16 40s13-16 13-25.4C29 7.6 23.2 2 16 2Z" fill="#790D20" stroke="#332420" stroke-width="2.5"/><circle cx="16" cy="14.5" r="5" fill="#F5E6CC"/></svg>`;

/** GeoJSON polygon approximating a circle of `km` around the site (equirectangular, fine at this scale). */
function circlePolygon(km: number): GeoJSON.Feature<GeoJSON.Polygon> {
  const { lat, lng } = SITE_COORDS;
  const dLat = km / 110.574;
  const dLng = km / (111.320 * Math.cos((lat * Math.PI) / 180));
  const ring: [number, number][] = [];
  for (let i = 0; i < CIRCLE_POINTS; i++) {
    const a = (2 * Math.PI * i) / CIRCLE_POINTS;
    ring.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  ring.push(ring[0]);
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } };
}

function fitCircle(map: MapLibreMap, km: number, animate: boolean) {
  const { lat, lng } = SITE_COORDS;
  const dLat = km / 110.574;
  const dLng = km / (111.320 * Math.cos((lat * Math.PI) / 180));
  map.fitBounds(
    [
      [lng - dLng, lat - dLat],
      [lng + dLng, lat + dLat],
    ],
    { padding: 16, animate, duration: 300 },
  );
}

export default function LocationMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [radiusKm, setRadiusKm] = useState(DELIVERY_RADIUS_KM);
  const radiusRef = useRef(radiusKm);

  // Create the map once (MapLibre touches `window`, so it is imported inside the effect).
  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | null = null;
    let observer: ResizeObserver | null = null;
    (async () => {
      const maplibregl = await import("maplibre-gl");
      maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");
      if (cancelled || !containerRef.current) return;
      // A calm, static poster of the neighbourhood: brand colours, no zoom/drag (nothing to fight on a phone).
      // "Du-mă acolo" next to it opens Google Maps for real navigation.
      const m = new maplibregl.Map({
        container: containerRef.current,
        style: BRAND_MAP_STYLE,
        center: [SITE_COORDS.lng, SITE_COORDS.lat],
        zoom: 15,
        interactive: false,
        attributionControl: false,
      });
      map = m;

      const pin = document.createElement("div");
      pin.innerHTML = PIN_HTML;
      pin.title = "Burgerash";
      new maplibregl.Marker({ element: pin, anchor: "bottom", offset: [0, 2] })
        .setLngLat([SITE_COORDS.lng, SITE_COORDS.lat])
        .addTo(m);

      m.on("load", () => {
        m.resize();
        m.addSource("delivery", { type: "geojson", data: circlePolygon(radiusRef.current) });
        m.addLayer({ id: "delivery-fill", type: "fill", source: "delivery", paint: { "fill-color": BRAND, "fill-opacity": 0.1 } });
        m.addLayer({
          id: "delivery-line",
          type: "line",
          source: "delivery",
          paint: { "line-color": BRAND, "line-width": 2.5, "line-dasharray": [2, 1.5] },
        });
      });
      fitCircle(m, radiusRef.current, false);
      mapRef.current = m;

      observer = new ResizeObserver(() => m.resize());
      observer.observe(containerRef.current);
    })();
    return () => {
      cancelled = true;
      observer?.disconnect();
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  const onRadius = (km: number) => {
    setRadiusKm(km);
    radiusRef.current = km;
    const map = mapRef.current;
    if (!map) return;
    const src = map.getSource("delivery") as GeoJSONSource | undefined;
    src?.setData(circlePolygon(km));
    fitCircle(map, km, true);
  };

  return (
    <div className="relative h-[320px] md:h-full md:min-h-[420px]">
      <div ref={containerRef} className="h-full w-full" role="img" aria-label="Hartă: locația Burgerash și zona de livrare de 1 km" />
      <span className="pointer-events-none absolute left-3 top-3 rounded-md border-2 border-charcoal bg-wine px-2.5 py-1 font-nunito text-xs font-black tracking-wider text-sand shadow-[2px_2px_0px_0px_var(--color-charcoal)]">
        LIVRARE {radiusKm.toLocaleString("ro-RO", { maximumFractionDigits: 1 })} KM
      </span>
      <span className="absolute bottom-1 right-2 font-mono text-[9px] text-charcoal/60">{ATTRIBUTION}</span>
      {SHOW_SLIDER && (
        <label className="absolute bottom-6 left-3 right-3 sm:right-auto sm:w-64 z-10 bg-sand border-2 border-charcoal rounded-lg px-3 py-2 font-mono text-xs font-bold text-charcoal">
          Rază livrare: {radiusKm.toFixed(1)} km
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={radiusKm}
            onChange={(e) => onRadius(Number(e.target.value))}
            className="block w-full accent-wine"
          />
        </label>
      )}
    </div>
  );
}
