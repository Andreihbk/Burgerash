import Link from 'next/link';

export default function KitchenPage() {
  return (
    <div className="min-h-screen bg-[#F5E6CC] text-[#332420] flex flex-col">
      {/* KDS Header */}
      <header className="border-b-4 border-[#332420] bg-[#332420] text-[#F5E6CC] p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bebas text-2xl text-[#F5E6CC] uppercase hover:text-[#790D20]">
            &larr; Burgerash
          </Link>
          <span className="font-mono text-sm px-2 py-0.5 bg-[#790D20] text-[#FFFFFF] font-bold">
            KITCHEN DISPLAY SYSTEM (KDS)
          </span>
        </div>
        <div className="font-mono text-xs flex gap-4">
          <span>STATION: MAIN GRILL</span>
          <span>STATUS: ONLINE</span>
        </div>
      </header>

      {/* Main KDS Grid */}
      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Incoming / New */}
        <div className="border-4 border-[#332420] bg-[#FFFFFF] p-4 flex flex-col">
          <div className="border-b-2 border-[#332420] pb-2 mb-4 flex justify-between items-center">
            <h2 className="font-mono font-bold text-lg uppercase text-[#790D20]">
              [01] Nou Intrate
            </h2>
            <span className="font-mono text-xs font-bold bg-[#790D20] text-[#FFFFFF] px-2 py-0.5">
              2 Comenzi
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {/* Ticket Card 1 */}
            <div className="border-2 border-[#332420] p-4 bg-[#F5E6CC] shadow-[4px_4px_0px_0px_#332420]">
              <div className="flex justify-between border-b border-[#332420] pb-1 mb-2 font-mono text-xs">
                <span className="font-bold text-[#790D20]">#1042</span>
                <span>acum 3 min</span>
              </div>
              <ul className="font-mono text-sm font-bold space-y-1">
                <li>2x DUBLE</li>
                <li>1x Cartofi Prăjiți Speciali</li>
                <li>1x Sos usturoi</li>
              </ul>
              <div className="mt-4 flex justify-end">
                <button className="bg-[#790D20] text-[#FFFFFF] font-mono text-xs font-bold px-3 py-1 uppercase border border-[#332420]">
                  Preia pe Plită &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: On Grill / Cooking */}
        <div className="border-4 border-[#332420] bg-[#FFFFFF] p-4 flex flex-col">
          <div className="border-b-2 border-[#332420] pb-2 mb-4 flex justify-between items-center">
            <h2 className="font-mono font-bold text-lg uppercase text-[#332420]">
              [02] Pe Plită / În Lucru
            </h2>
            <span className="font-mono text-xs font-bold bg-[#332420] text-[#F5E6CC] px-2 py-0.5">
              1 Comandă
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {/* Ticket Card 2 */}
            <div className="border-2 border-[#332420] p-4 bg-[#FFFFFF] shadow-[4px_4px_0px_0px_#332420]">
              <div className="flex justify-between border-b border-[#332420] pb-1 mb-2 font-mono text-xs">
                <span className="font-bold text-[#332420]">#1041</span>
                <span>acum 7 min</span>
              </div>
              <ul className="font-mono text-sm font-bold space-y-1">
                <li>1x Bacon Smash Deluxe</li>
                <li>1x Inele de Ceapă</li>
              </ul>
              <div className="mt-4 flex justify-end">
                <button className="bg-[#332420] text-[#F5E6CC] font-mono text-xs font-bold px-3 py-1 uppercase border border-[#332420]">
                  Gata de Ambalare &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Ready for Packing */}
        <div className="border-4 border-[#332420] bg-[#FFFFFF] p-4 flex flex-col">
          <div className="border-b-2 border-[#332420] pb-2 mb-4 flex justify-between items-center">
            <h2 className="font-mono font-bold text-lg uppercase text-[#790D20]">
              [03] Finalizate Kitchen
            </h2>
            <span className="font-mono text-xs font-bold bg-[#790D20] text-[#FFFFFF] px-2 py-0.5">
              0 Comenzi
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center font-mono text-xs text-[#332420]/60 uppercase">
            Nicio comandă în așteptare la expediere.
          </div>
        </div>
      </main>
    </div>
  );
}
