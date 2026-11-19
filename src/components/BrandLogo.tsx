import React from "react";

// Single source of truth for the Burgerash logo (reference: docs/brand/logo-reference.png).
// Line-art burger icon + lowercase "burgerash" wordmark + "handcrafted burgers" tagline.
// The tagline is part of the wordmark lockup and is never rendered alone.
// Colors: wine on sand (default) or sand on wine/charcoal. Nothing else.

export type BrandLogoVariant = "full" | "horizontal" | "icon";
export type BrandLogoTone = "wine" | "sand";

interface BrandLogoProps {
  /** full: icon above wordmark + tagline. horizontal: icon left, text right. icon: icon only. */
  variant?: BrandLogoVariant;
  /** wine = for sand backgrounds (default). sand = for wine/charcoal backgrounds. */
  tone?: BrandLogoTone;
  /** Size it with height (h-*) and w-auto. */
  className?: string;
}

const TONE_CLASS: Record<BrandLogoTone, string> = {
  wine: "text-[#790D20]",
  sand: "text-[#F5E6CC]",
};

// Icon is drawn in a 44 x 49 box.
function BurgerIcon({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      fill="none"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Dome bun */}
      <path d="M3 22 C3 11 11 3 22 3 C33 3 41 11 41 22 Z" />
      {/* Highlight arc */}
      <path d="M27 9 C32 10 35 13 36 18" />
      {/* Patty bars */}
      <rect x="3" y="27" width="38" height="5" rx="2" />
      {/* Bottom bun, rounded underside */}
      <path d="M3 37 H41 V40 A6 6 0 0 1 35 46 H9 A6 6 0 0 1 3 40 Z" />
    </g>
  );
}

const TEXT_FONT = { fontFamily: "var(--font-nunito), system-ui, sans-serif" } as const;

function Lockup({ cx, wordY, tagY, wordSize, tagSize, wordWidth, tagWidth }: {
  cx: number;
  wordY: number;
  tagY: number;
  wordSize: number;
  tagSize: number;
  wordWidth: number;
  tagWidth: number;
}) {
  return (
    <g fill="currentColor" textAnchor="middle" style={TEXT_FONT}>
      <text x={cx} y={wordY} fontSize={wordSize} fontWeight={900} textLength={wordWidth} lengthAdjust="spacingAndGlyphs">
        burgerash
      </text>
      {/* Even letter-spacing: textLength distributes the extra space between glyphs equally */}
      <text x={cx} y={tagY} fontSize={tagSize} fontWeight={700} textLength={tagWidth} lengthAdjust="spacing">
        handcrafted burgers
      </text>
    </g>
  );
}

export function BrandLogo({ variant = "full", tone = "wine", className = "" }: BrandLogoProps) {
  const cls = `${TONE_CLASS[tone]} ${className}`.trim();

  if (variant === "icon") {
    return (
      <svg viewBox="0 0 44 49" role="img" aria-label="burgerash" className={cls}>
        <BurgerIcon />
      </svg>
    );
  }

  if (variant === "horizontal") {
    return (
      <svg viewBox="0 0 224 50" role="img" aria-label="burgerash, handcrafted burgers" className={cls}>
        <BurgerIcon y={0.5} />
        <Lockup cx={140} wordY={32} tagY={47} wordSize={36} tagSize={11} wordWidth={160} tagWidth={136} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 124" role="img" aria-label="burgerash, handcrafted burgers" className={cls}>
      <BurgerIcon x={78} />
      <Lockup cx={100} wordY={90} tagY={114} wordSize={42} tagSize={14} wordWidth={190} tagWidth={160} />
    </svg>
  );
}
