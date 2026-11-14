import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5E6CC] text-[#332420] flex flex-col justify-between">
      {/* Header */}
      <header className="border-b-4 border-[#332420] p-6 flex justify-between items-center bg-[#F5E6CC] sticky top-0 z-50">
        <h1 className="font-eatvetica text-4xl md:text-5xl text-[#790D20] tracking-tighter uppercase">
          Burgerash
        </h1>
        <nav className="flex gap-4 font-mono text-sm font-bold">
          <Link
            href="/kitchen"
            className="px-3 py-1.5 bg-[#790D20] text-[#FFFFFF] hover:opacity-90 uppercase transition-all"
          >
            Kitchen
          </Link>
          <Link
            href="/dispatch"
            className="px-3 py-1.5 bg-[#332420] text-[#F5E6CC] hover:opacity-90 uppercase transition-all"
          >
            Dispatch
          </Link>
          <Link
            href="/rider"
            className="px-3 py-1.5 border-2 border-[#790D20] text-[#790D20] hover:bg-[#790D20] hover:text-[#FFFFFF] uppercase transition-all"
          >
            Rider
          </Link>
          <Link
            href="/admin"
            className="px-3 py-1.5 border-2 border-[#332420] text-[#332420] hover:bg-[#332420] hover:text-[#F5E6CC] uppercase transition-all"
          >
            Admin
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-12 flex flex-col justify-center gap-8">
        <div className="border-4 border-[#332420] bg-[#FFFFFF] p-8 md:p-12 shadow-[8px_8px_0px_0px_#332420]">
          <span className="inline-block bg-[#790D20] text-[#FFFFFF] font-mono text-xs px-3 py-1 mb-4 uppercase font-bold tracking-widest">
            FOC • PRESA • CRUSTĂ
          </span>
          <h2 className="font-eatvetica text-5xl md:text-7xl uppercase text-[#332420] leading-none mb-6">
            Smash Burgers <br />
            <span className="text-[#790D20]">Fără Compromis.</span>
          </h2>
          <p className="font-nunito font-bold text-lg md:text-xl text-[#332420] max-w-2xl mb-8">
            Comandă online smash burgeri proaspeți, prăjiți pe plită încinsă și livrați rapid direct la ușa ta.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="bg-[#790D20] text-[#FFFFFF] font-mono font-bold px-8 py-4 text-lg border-2 border-[#332420] shadow-[4px_4px_0px_0px_#332420] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all uppercase">
              Vezi Meniul
            </button>
            <button className="bg-[#F5E6CC] text-[#332420] font-mono font-bold px-8 py-4 text-lg border-2 border-[#332420] shadow-[4px_4px_0px_0px_#332420] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all uppercase">
              Urmărește Comanda
            </button>
          </div>
        </div>

        {/* Operational Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Link
            href="/kitchen"
            className="border-2 border-[#332420] bg-[#FFFFFF] p-5 hover:border-[#790D20] transition-all group"
          >
            <h3 className="font-mono font-bold text-[#790D20] group-hover:underline">
              [01] Kitchen System &rarr;
            </h3>
            <p className="font-nunito text-sm text-[#332420] mt-1">
              Ecran bucătărie & pregătire comenzi live.
            </p>
          </Link>

          <Link
            href="/dispatch"
            className="border-2 border-[#332420] bg-[#FFFFFF] p-5 hover:border-[#790D20] transition-all group"
          >
            <h3 className="font-mono font-bold text-[#332420] group-hover:underline">
              [02] Dispatch Station &rarr;
            </h3>
            <p className="font-nunito text-sm text-[#332420] mt-1">
              Ambalare și asignare curieri.
            </p>
          </Link>

          <Link
            href="/rider"
            className="border-2 border-[#332420] bg-[#FFFFFF] p-5 hover:border-[#790D20] transition-all group"
          >
            <h3 className="font-mono font-bold text-[#790D20] group-hover:underline">
              [03] Rider App &rarr;
            </h3>
            <p className="font-nunito text-sm text-[#332420] mt-1">
              Preluare și livrare la client.
            </p>
          </Link>

          <Link
            href="/admin"
            className="border-2 border-[#332420] bg-[#FFFFFF] p-5 hover:border-[#790D20] transition-all group"
          >
            <h3 className="font-mono font-bold text-[#332420] group-hover:underline">
              [04] Admin Panel &rarr;
            </h3>
            <p className="font-nunito text-sm text-[#332420] mt-1">
              Raportare și management stocuri.
            </p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-[#332420] bg-[#332420] text-[#F5E6CC] p-6 text-center font-mono text-xs">
        BURGERASH OPERATIONAL SYSTEM &copy; {new Date().getFullYear()} — BUTTER CREAM #F5E6CC | BURGUNDY #790D20 | CHARCOAL #332420
      </footer>
    </div>
  );
}
