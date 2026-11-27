import type { StyleSpecification } from "maplibre-gl";

// Brand map style on OpenFreeMap vector tiles (OpenMapTiles schema). Brand tokens only (sand / charcoal / wine,
// with transparency). No text layers: no extra fonts, and the map reads as a calm poster of the neighbourhood;
// our own labels (pin, "1 KM") are HTML in Nunito on top.
const SAND = "#F5E6CC";
const ink = (a: number) => `rgba(51, 36, 32, ${a})`; // #332420 charcoal

export const MAP_SOURCE_URL = "https://tiles.openfreemap.org/planet";

const roadWidth = (base: number) =>
  ["interpolate", ["exponential", 1.6], ["zoom"], 12, base * 0.4, 15, base, 18, base * 4] as unknown as number;

export const BRAND_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    openmaptiles: { type: "vector", url: MAP_SOURCE_URL },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": SAND } },
    {
      id: "park",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "park",
      paint: { "fill-color": ink(0.07) },
    },
    {
      id: "landcover",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landcover",
      filter: ["in", ["get", "class"], ["literal", ["grass", "wood", "farmland"]]],
      paint: { "fill-color": ink(0.06) },
    },
    {
      id: "water",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "water",
      paint: { "fill-color": ink(0.16) },
    },
    {
      id: "building",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: 14,
      paint: { "fill-color": ink(0.09) },
    },
    {
      id: "rail",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["==", ["get", "class"], "rail"],
      paint: { "line-color": ink(0.35), "line-width": 1, "line-dasharray": [3, 2] },
    },
    {
      id: "road-minor",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["minor", "service"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ink(0.3), "line-width": roadWidth(1.4) },
    },
    {
      id: "road-mid",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["tertiary", "secondary"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ink(0.55), "line-width": roadWidth(2.4) },
    },
    {
      id: "road-major",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["primary", "trunk", "motorway"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ink(0.8), "line-width": roadWidth(3.6) },
    },
  ],
};
