import React from "react";
import { stripDiacritics } from "@/lib/display";
import type { Product } from "@/types/database";

// Round product stickers, rebuilt in SVG from the printed sticker sheet.
// Product names come from catalog.ts; `lines` only controls line breaks on the sticker.
// Colors are tokens from globals.css only: 3 brand tokens + per-product --color-sticker-* accents.

const SAND = "var(--color-brand-sand)";
const WINE = "var(--color-brand-wine)";
const CHARCOAL = "var(--color-brand-charcoal)";

interface StickerStyle {
  /** Sticker artwork text (Romanian, as printed), one entry per line. */
  lines: string[];
  accent: string;
  /** Text/ring color; sand unless the accent is light. */
  ink?: string;
}

const PRODUCT_STICKERS: Record<string, StickerStyle> = {
  "prod-classic": { lines: ["CLASIC"], accent: "var(--color-sticker-classic)" },
  "prod-double": { lines: ["DOUBLE"], accent: "var(--color-sticker-double)" },
  "prod-hot-boy": { lines: ["HOT BOY"], accent: "var(--color-sticker-hot-boy)" },
  "prod-hot-honey": { lines: ["HOT HONEY"], accent: "var(--color-sticker-hot-honey)" },
  "prod-crispy": { lines: ["CRISPY"], accent: "var(--color-sticker-crispy)" },
  "prod-crispy-bacon": { lines: ["CRISPY", "BACON"], accent: "var(--color-sticker-crispy-bacon)", ink: WINE },
};

// Simple stickers (no artwork): sides use wine; each drink has its own accent.
const SIMPLE_ACCENT_BY_CATEGORY: Record<string, string> = {
  "cat-sides": WINE,
  "cat-drinks": CHARCOAL,
};
const SIMPLE_STICKERS: Record<string, { accent: string; ink?: string }> = {
  "prod-cola": { accent: "var(--color-sticker-cola)" },
  "prod-fanta": { accent: "var(--color-sticker-fanta)" },
  "prod-sprite": { accent: "var(--color-sticker-sprite)" },
  "prod-water": { accent: "var(--color-sticker-water)" },
};

// Nunito Black caps are roughly 0.65em wide; keep names inside a ~150-unit band.
function fitFontSize(lines: string[], max: number): number {
  const longest = Math.max(...lines.map((l) => l.length));
  return Math.min(max, Math.floor(150 / (longest * 0.65)));
}

interface BurgerStampProps {
  product?: Pick<Product, "id" | "name" | "category_id" | "weight_grams" | "weight_label"> | null;
  className?: string;
}

export function BurgerStamp({ product, className = "" }: BurgerStampProps) {
  // Never crash the storefront on a missing product (e.g. stale cart data or a bad caller).
  if (!product?.id || !product.name) return null;

  const style = PRODUCT_STICKERS[product.id];
  const isSimple = !style;
  const simple = SIMPLE_STICKERS[product.id];
  const accent =
    style?.accent ?? simple?.accent ?? SIMPLE_ACCENT_BY_CATEGORY[product.category_id] ?? WINE;
  const ink = style?.ink ?? simple?.ink ?? SAND;
  const lines = style?.lines ?? [product.name.toUpperCase()];
  const label = isSimple ? product.name : `${product.name}${product.weight_label ? `, ${product.weight_label}` : ""}`;

  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={`Sticker ${label}`}
      className={className}
    >
      {/* Outer halo + disc + inner ring */}
      <circle cx="100" cy="100" r="99" style={{ fill: SAND }} />
      <circle cx="100" cy="100" r="94" style={{ fill: accent }} />
      <circle cx="100" cy="100" r="86" fill="none" strokeWidth="1.5" style={{ stroke: ink }} />

      {isSimple ? (
        <SimpleBody lines={lines} ink={ink} />
      ) : (
        <FullBody lines={lines} ink={ink} accent={accent} weight={product.weight_grams} />
      )}
    </svg>
  );
}

function BurgerIcon({ ink }: { ink: string }) {
  return (
    <g fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: ink }}>
      <path d="M80 45 C80 31 90 25 100 25 C110 25 120 31 120 45 Z" />
      <path d="M104 30 C109 31 113 34 114 38" />
      <rect x="79" y="48.5" width="42" height="4.5" rx="2.25" />
      <rect x="79" y="56" width="42" height="7" rx="3.5" />
    </g>
  );
}

function Wordmark({ ink, y, size, tagline }: { ink: string; y: number; size: number; tagline: boolean }) {
  return (
    <g className="font-nunito" textAnchor="middle" style={{ fill: ink }}>
      <text x="100" y={y} fontSize={size} fontWeight="800">
        burgerash
      </text>
      {tagline && (
        <text x="100" y={y + 10} fontSize="6.5" fontWeight="600">
          handcrafted burgers
        </text>
      )}
    </g>
  );
}

function NameLines({ lines, ink, baselines, size }: { lines: string[]; ink: string; baselines: number[]; size: number }) {
  return (
    <g className="font-bebas" textAnchor="middle" style={{ fill: ink }}>
      {lines.map((line, i) => (
        <text key={line} x="100" y={baselines[i]} fontSize={size}>
          {stripDiacritics(line)}
        </text>
      ))}
    </g>
  );
}

function Rule({ y, x1, x2, ink }: { y: number; x1: number; x2: number; ink: string }) {
  return <line x1={x1} x2={x2} y1={y} y2={y} strokeWidth="1.5" style={{ stroke: ink }} />;
}

function FullBody({ lines, ink, accent, weight }: { lines: string[]; ink: string; accent: string; weight: number | null }) {
  const twoLines = lines.length > 1;
  const size = fitFontSize(lines, twoLines ? 32 : 60);
  const baselines = twoLines ? [123, 147] : [141];

  return (
    <>
      <BurgerIcon ink={ink} />
      <Wordmark ink={ink} y={80} size={17} tagline />
      <Rule y={98} x1={30} x2={170} ink={ink} />
      <NameLines lines={lines} ink={ink} baselines={baselines} size={size} />
      <Rule y={150} x1={36} x2={164} ink={ink} />

      {weight != null && (
        <>
          <g strokeWidth="1.5" strokeLinecap="round" style={{ stroke: ink }}>
            <line x1="52" x2="66" y1="164" y2="164" />
            <line x1="56" x2="66" y1="168" y2="168" />
            <line x1="134" x2="148" y1="164" y2="164" />
            <line x1="134" x2="144" y1="168" y2="168" />
          </g>
          <rect x="71" y="155" width="58" height="22" rx="11" style={{ fill: SAND }} />
          <text
            x="100"
            y="172"
            textAnchor="middle"
            fontSize="18"
            className="font-bebas"
            style={{ fill: ink === SAND ? accent : ink }}
          >
            <tspan className="font-nunito" style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
              {weight}
            </tspan>{" "}
            G
          </text>
        </>
      )}
    </>
  );
}

function SimpleBody({ lines, ink }: { lines: string[]; ink: string }) {
  const size = fitFontSize(lines, 60);
  return (
    <>
      <Wordmark ink={ink} y={66} size={20} tagline />
      <Rule y={86} x1={30} x2={170} ink={ink} />
      <NameLines lines={lines} ink={ink} baselines={[137]} size={size} />
      <Rule y={148} x1={36} x2={164} ink={ink} />
      <g strokeWidth="1.5" strokeLinecap="round" style={{ stroke: ink }}>
        <line x1="84" x2="116" y1="162" y2="162" />
        <line x1="92" x2="108" y1="167" y2="167" />
      </g>
    </>
  );
}
