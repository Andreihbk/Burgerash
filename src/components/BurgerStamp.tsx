import React from "react";

interface BurgerStampProps {
text?: string | null;
variant?: "burgundy" | "charcoal" | "cream" | null;
weightGrams?: number | null;
className?: string;
}

export function BurgerStamp({
text = "CLASSIC // 270G",
variant = "cream",
weightGrams,
className = "",
}: BurgerStampProps) {
const bgColor =
variant === "burgundy"
? "bg-brand-red text-white border-white/30"
: variant === "charcoal"
? "bg-brand-dark text-brand-paper border-brand-paper/30"
: "bg-[#EBE4D1] text-brand-dark border-brand-dark/20";

return (
<div
className={`relative inline-flex items-center justify-center rounded-full border-2 border-dashed p-3 shadow-[2px_2px_0px_0px_rgba(18,18,18,1)] rotate-[-6deg] hover:rotate-0 transition-transform ${bgColor} ${className}`}
style={{ width: "92px", height: "92px" }}
>
<div className="text-center flex flex-col items-center justify-center leading-none">
<span className="font-eatvetica text-[10px] tracking-widest opacity-80 uppercase">
burgerash
</span>
<span className="font-eatvetica font-black text-xs tracking-tighter my-0.5 line-clamp-1">
{(text ?? "").split("//")[0].trim()}
</span>
{weightGrams && (
<span className="font-mono text-[9px] font-bold tracking-tight bg-black/10 px-1 py-0.5 rounded">
= {weightGrams}G =
</span>
)}
</div>
</div>
);
}