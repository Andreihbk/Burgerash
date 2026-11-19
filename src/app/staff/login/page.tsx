import type { Metadata } from "next";
import { BrandLogo } from "@/components/BrandLogo";
import { safeNext } from "@/lib/safe-next";
import { Display } from "@/components/Display";

export const metadata: Metadata = { title: "Acces personal | Burgerash", robots: { index: false } };

const ERRORS: Record<string, string> = {
  credentials: "Email sau parolă greșită.",
  rate: "Prea multe încercări. Așteaptă puțin și încearcă din nou.",
  config: "Accesul personalului nu este configurat.",
};

const FIELD = "min-h-12 px-3 border-2 border-[#332420] bg-transparent font-nunito text-lg";

export default async function StaffAuthLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="min-h-screen bg-[#F5E6CC] text-[#332420] flex items-center justify-center p-4">
      <form
        method="post"
        action="/api/staff-auth/login"
        className="w-full max-w-sm border-2 border-[#332420] shadow-[4px_4px_0_0_#332420] p-6 flex flex-col gap-4"
      >
        <BrandLogo variant="full" tone="wine" className="h-24 w-auto mx-auto" />
        <h1 className="font-bebas text-4xl tracking-wide"><Display>ACCES PERSONAL</Display></h1>
        <input type="hidden" name="next" value={safeNext(next)} />
        <label className="font-nunito font-bold flex flex-col gap-1">
          Email
          <input type="email" name="email" required autoFocus autoComplete="username" className={FIELD} />
        </label>
        <label className="font-nunito font-bold flex flex-col gap-1">
          Parolă
          <input type="password" name="password" required autoComplete="current-password" className={FIELD} />
        </label>
        {error && (
          <p role="alert" className="font-nunito font-bold text-[#790D20]">
            {ERRORS[error] ?? ERRORS.credentials}
          </p>
        )}
        <button type="submit" className="min-h-14 bg-[#790D20] text-[#F5E6CC] font-bebas text-2xl tracking-wide">
          <Display>INTRĂ</Display>
        </button>
      </form>
    </main>
  );
}
