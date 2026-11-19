"use client";

// LOCAL-ONLY preview of Eatvetica (NOT licensed for the live site).
// Renders only when NEXT_PUBLIC_FONT_PREVIEW === "true" (set in .env.local, never in Vercel).
// The font file lives in public/local-fonts/ which is gitignored.
// With the flag off this returns null: no CSS, no font request.
export default function FontPreview() {
  if (process.env.NEXT_PUBLIC_FONT_PREVIEW !== "true") return null;

  // Nunito stays as fallback so missing glyphs (ă ș ț, digits) still render.
  // .font-bebas is the display class (headings, product names, prices, stickers).
  const css = `
@font-face {
  font-family: "Eatvetica";
  src: url("/local-fonts/eatvetica.otf") format("opentype");
  font-weight: 100 900;
  font-display: swap;
  /* No digits: they always fall back to Nunito (also anywhere a number is not wrapped in <Display>). */
  unicode-range: U+0020-002F, U+003A-007E, U+00A0-024F, U+2000-206F;
}
body .font-bebas {
  font-family: "Eatvetica", var(--font-nunito), system-ui, sans-serif;
  font-weight: 400;
}`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
