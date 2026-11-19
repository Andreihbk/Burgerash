import type { Metadata } from "next";

export const metadata: Metadata = { title: "Acces personal | Burgerash", robots: { index: false } };

const ERRORS: Record<string, string> = {
  password: "Parolă greșită.",
  config: "Accesul personalului nu este configurat.",
};

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="min-h-screen bg-[#F5E6CC] text-[#332420] flex items-center justify-center p-4">
      <form
        method="post"
        action="/api/staff-login"
        className="w-full max-w-sm border-2 border-[#332420] shadow-[4px_4px_0_0_#332420] p-6 flex flex-col gap-4"
      >
        <h1 className="font-bebas text-4xl tracking-wide">ACCES PERSONAL</h1>
        <input type="hidden" name="next" value={next ?? "/kitchen"} />
        <label className="font-nunito font-bold flex flex-col gap-1">
          Parolă
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            className="min-h-12 px-3 border-2 border-[#332420] bg-transparent font-nunito text-lg"
          />
        </label>
        {error && (
          <p role="alert" className="font-nunito font-bold text-[#790D20]">
            {ERRORS[error] ?? ERRORS.password}
          </p>
        )}
        <button type="submit" className="min-h-14 bg-[#790D20] text-[#F5E6CC] font-bebas text-2xl tracking-wide">
          INTRĂ
        </button>
      </form>
    </main>
  );
}
