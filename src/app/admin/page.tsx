import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#F5E6CC] text-[#332420] flex flex-col">
      {/* Admin Header */}
      <header className="border-b-4 border-[#332420] bg-[#332420] text-[#F5E6CC] p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bebas text-3xl text-[#F5E6CC] uppercase hover:text-[#790D20]">
            &larr; Burgerash Admin
          </Link>
          <span className="font-mono text-xs px-2 py-1 bg-[#790D20] text-[#FFFFFF] font-bold">
            PANOU DE CONTROL
          </span>
        </div>
        <div className="font-mono text-xs">
          LOGGED IN AS: MANAGER
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border-4 border-[#332420] bg-[#FFFFFF] p-6 shadow-[6px_6px_0px_0px_#332420]">
            <span className="font-mono text-xs font-bold text-[#790D20] uppercase">Vânzări Astăzi</span>
            <p className="font-bebas text-4xl text-[#332420] mt-2">3.480 LEI</p>
            <span className="font-mono text-xs text-[#332420]/70">+12% față de ieri</span>
          </div>

          <div className="border-4 border-[#332420] bg-[#FFFFFF] p-6 shadow-[6px_6px_0px_0px_#332420]">
            <span className="font-mono text-xs font-bold text-[#790D20] uppercase">Comenzi Totale</span>
            <p className="font-bebas text-4xl text-[#332420] mt-2">84</p>
            <span className="font-mono text-xs text-[#332420]/70">Medie prep: 14 min</span>
          </div>

          <div className="border-4 border-[#332420] bg-[#FFFFFF] p-6 shadow-[6px_6px_0px_0px_#332420]">
            <span className="font-mono text-xs font-bold text-[#790D20] uppercase">Curieri Activi</span>
            <p className="font-bebas text-4xl text-[#332420] mt-2">4</p>
            <span className="font-mono text-xs text-[#332420]/70">Timp livrare: ~22 min</span>
          </div>

          <div className="border-4 border-[#332420] bg-[#FFFFFF] p-6 shadow-[6px_6px_0px_0px_#332420]">
            <span className="font-mono text-xs font-bold text-[#790D20] uppercase">Stoc Carne Smash</span>
            <p className="font-bebas text-4xl text-[#790D20] mt-2">18.5 KG</p>
            <span className="font-mono text-xs text-[#332420]/70">Reaprovizionare la 5 KG</span>
          </div>
        </div>

        {/* Management Quick Actions */}
        <div className="border-4 border-[#332420] bg-[#FFFFFF] p-6 shadow-[8px_8px_0px_0px_#332420]">
          <h2 className="font-bebas text-3xl uppercase text-[#332420] border-b-2 border-[#332420] pb-2 mb-6">
            Management Operativ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="border-2 border-[#332420] bg-[#F5E6CC] p-4 font-mono font-bold text-left hover:bg-[#790D20] hover:text-[#FFFFFF] transition-all">
              [01] Editare Meniu & Prețuri
            </button>
            <button className="border-2 border-[#332420] bg-[#F5E6CC] p-4 font-mono font-bold text-left hover:bg-[#790D20] hover:text-[#FFFFFF] transition-all">
              [02] Setări Bucătărie & Orar
            </button>
            <button className="border-2 border-[#332420] bg-[#F5E6CC] p-4 font-mono font-bold text-left hover:bg-[#790D20] hover:text-[#FFFFFF] transition-all">
              [03] Istoric & Rapoarte
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
