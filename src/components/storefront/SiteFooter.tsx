import { BrandLogo } from "../BrandLogo";

export default function SiteFooter() {
  return (
    <footer className="max-w-6xl mx-auto px-4 mt-20 pt-8 border-t-2 border-[#332420]/20 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#332420]/70">
      <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <BrandLogo variant="horizontal" tone="wine" className="h-10 w-auto shrink-0" />
        <div>
        <p className="font-bold text-[#332420]">GOOD BURGERS /// GOOD PEOPLE /// ALWAYS</p>
        <p className="mt-1">© 2026 Burgerash. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
}
