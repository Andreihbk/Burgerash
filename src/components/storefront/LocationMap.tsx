"use client";

import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import { DELIVERY_RADIUS_KM, SITE_COORDS } from "@/lib/site";

// TEMPORARY: radius slider is only for tuning the circle locally (NEXT_PUBLIC_MAP_TUNING=true).
const SHOW_SLIDER = process.env.NEXT_PUBLIC_MAP_TUNING === "true";

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
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
      const m = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: [SITE_COORDS.lng, SITE_COORDS.lat],
        zoom: 15,
        attributionControl: false,
        scrollZoom: false,
        dragRotate: false,
        touchPitch: false,
        cooperativeGestures: false,
      });
      map = m;
      m.touchZoomRotate.disableRotation();
      m.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: ATTRIBUTION }));
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

      // Warm brand tint on the canvas only; the HTML pin marker stays unfiltered.
      m.getCanvas().style.filter = "sepia(0.35) saturate(0.8) hue-rotate(-10deg)";

      // No scroll hijack: wheel zoom turns on after a click on the map, off again when the pointer leaves.
      m.on("click", () => m.scrollZoom.enable());
      m.getCanvasContainer().addEventListener("mouseleave", () => m.scrollZoom.disable());

      const pin = document.createElement("div");
      pin.innerHTML = PIN_HTML;
      pin.title = "Burgerash";
      new maplibregl.Marker({ element: pin, anchor: "bottom", offset: [0, 2] })
        .setLngLat([SITE_COORDS.lng, SITE_COORDS.lat])
        .addTo(m);

      m.on("load", () => {
        m.addSource("delivery", { type: "geojson", data: circlePolygon(radiusRef.current) });
        m.addLayer({ id: "delivery-fill", type: "fill", source: "delivery", paint: { "fill-color": BRAND, "fill-opacity": 0.15 } });
        m.addLayer({ id: "delivery-line", type: "line", source: "delivery", paint: { "line-color": BRAND, "line-width": 2 } });
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
    <div className="relative h-[320px] md:h-full md:min-h-[320px]">
      <div ref={containerRef} className="absolute inset-0" role="img" aria-label="Hartă: locația Burgerash și zona de livrare" />
      {SHOW_SLIDER && (
        <label className="absolute bottom-6 left-3 right-3 sm:right-auto sm:w-64 z-10 bg-[#F5E6CC] border-2 border-[#332420] rounded-lg px-3 py-2 font-mono text-xs font-bold text-[#332420]">
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
