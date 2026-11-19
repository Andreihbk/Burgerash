// Copies the MapLibre worker into /public so we serve it ourselves (no CDN, no bundler worker chunk).
import { copyFileSync, mkdirSync } from "node:fs";

const src = new URL("../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url);
const dest = new URL("../public/maplibre-gl-worker.mjs", import.meta.url);
mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
copyFileSync(src, dest);
console.log("maplibre worker copied to public/maplibre-gl-worker.mjs");
