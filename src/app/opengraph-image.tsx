import { ImageResponse } from "next/og";

export const alt = "Burgerash: Nu facem medium. Facem crustă.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const WINE = "#790D20";
const SAND = "#F5E6CC";
const CHARCOAL = "#332420";

// Bebas Neue for the image text; falls back to the default font if the download fails.
async function loadBebas(): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Bebas+Neue")).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

const MENU: [string, string][] = [
  ["CLASIC", "36"],
  ["HOT BOY", "39"],
  ["DOUBLE", "46"],
  ["CRISPY", "38"],
  ["HOT HONEY", "38"],
];

const STICKERS = [
  { label: "CLASIC", bg: "#0B391C", fg: SAND, x: 0, y: 70, r: -10 },
  { label: "DOUBLE", bg: "#6D050A", fg: SAND, x: 170, y: 0, r: 8 },
  { label: "HOT BOY", bg: "#B50711", fg: SAND, x: 330, y: 90, r: -4 },
];

export default async function Image() {
  const font = await loadBebas();
  const fonts = font ? [{ name: "Bebas", data: font, style: "normal" as const, weight: 400 as const }] : undefined;
  const family = font ? "Bebas" : "sans-serif";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: SAND, fontFamily: family, padding: 48 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 520, color: CHARCOAL }}>
          <div style={{ display: "flex", fontSize: 40, color: WINE, letterSpacing: 4 }}>BURGERASH</div>
          <div style={{ display: "flex", fontSize: 118, lineHeight: 0.92, marginTop: 12 }}>NU FACEM MEDIUM.</div>
          <div style={{ display: "flex", fontSize: 118, lineHeight: 0.92, color: WINE }}>FACEM CRUSTĂ.</div>
        </div>

        <div style={{ display: "flex", position: "relative", flex: 1, justifyContent: "flex-end", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 470,
              background: WINE,
              border: `6px solid ${CHARCOAL}`,
              borderRadius: 16,
              padding: 18,
              boxShadow: `12px 12px 0 ${CHARCOAL}`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", background: SAND, borderRadius: 8, padding: "26px 30px", color: WINE }}>
              <div style={{ display: "flex", height: 70 }} />
              {MENU.map(([name, price]) => (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", fontSize: 38, lineHeight: 1.3 }}>
                  <span>{name}</span>
                  <span>{price} LEI</span>
                </div>
              ))}
            </div>
          </div>

          {STICKERS.map((s) => (
            <div
              key={s.label}
              style={{
                position: "absolute",
                left: s.x - 40,
                top: s.y - 20,
                width: 170,
                height: 170,
                borderRadius: 85,
                background: s.bg,
                border: `6px solid ${SAND}`,
                boxShadow: `6px 6px 0 ${CHARCOAL}`,
                color: s.fg,
                fontSize: 38,
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                transform: `rotate(${s.r}deg)`,
              }}
            >
              {s.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
