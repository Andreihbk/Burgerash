import React from "react";

// Burgerash logo as on the menu board: line-art burger icon + lowercase "burgerash" wordmark.
// Uses currentColor, so the parent sets the color with a brand token (text-[#...]).

interface BrandLogoProps {
  /** "inline": icon left of the wordmark (header). "stacked": icon above (menu board). */
  layout?: "inline" | "stacked";
  className?: string;
}

function BurgerIcon({ x, y }: { x: number; y: number }) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Bun top, shine, patty, bottom bun */}
      <path d="M2 21 C2 8 11 2 20 2 C29 2 38 8 38 21 Z" />
      <path d="M24 7 C29 8 32 11 33 15" />
      <rect x="2" y="25" width="36" height="4.5" rx="2.25" />
      <rect x="2" y="33" width="36" height="7" rx="3.5" />
    </g>
  );
}

export function BrandLogo({ layout = "inline", className = "" }: BrandLogoProps) {
  if (layout === "stacked") {
    return (
      <svg viewBox="0 0 170 84" role="img" aria-label="burgerash" className={className}>
        <BurgerIcon x={65} y={2} />
        <text
          x="85"
          y="78"
          textAnchor="middle"
          fontSize="34"
          fontWeight="900"
          className="font-nunito"
          fill="currentColor"
        >
          burgerash
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 214 44" role="img" aria-label="burgerash" className={className}>
      <BurgerIcon x={2} y={2} />
      <text x="50" y="33" fontSize="34" fontWeight="900" className="font-nunito" fill="currentColor">
        burgerash
      </text>
    </svg>
  );
}
