import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens only: full logo (icon + wordmark + tagline, see BrandLogo.tsx) in wine on sand.
const WINE = "#790D20";
const SAND = "#F5E6CC";

type OgFont = { name: string; data: ArrayBuffer; weight: 700 | 900; style: "normal" };

// Nunito (the logo's font) at 700 and 900; falls back to the default font if the download fails.
async function loadNunito(): Promise<OgFont[]> {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Nunito:wght@700;900")).text();
    const blocks = css.split("@font-face").slice(1);
    const fonts: OgFont[] = [];
    for (const block of blocks) {
      const weight = Number(block.match(/font-weight:\s*(\d+)/)?.[1]);
      const url = block.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
      if ((weight === 700 || weight === 900) && url && !fonts.some((f) => f.weight === weight)) {
        fonts.push({ name: "Nunito", data: await (await fetch(url)).arrayBuffer(), weight, style: "normal" });
      }
    }
    return fonts;
  } catch {
    return [];
  }
}

export default async function Image() {
  const fonts = await loadNunito();
  const family = fonts.length ? "Nunito" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: SAND,
          color: WINE,
          fontFamily: family,
        }}
      >
        <svg width="198" height="220" viewBox="0 0 44 49" fill="none" stroke={WINE} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 22 C3 11 11 3 22 3 C33 3 41 11 41 22 Z" />
          <path d="M27 9 C32 10 35 13 36 18" />
          <rect x="3" y="27" width="38" height="5" rx="2" />
          <path d="M3 37 H41 V40 A6 6 0 0 1 35 46 H9 A6 6 0 0 1 3 40 Z" />
        </svg>
        <div style={{ display: "flex", fontSize: 190, fontWeight: 900, lineHeight: 1, marginTop: 8 }}>burgerash</div>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: 14, marginTop: 14 }}>
          HANDCRAFTED BURGERS
        </div>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: 2, marginTop: 44 }}>burgerash.ro</div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
