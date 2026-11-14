import Link from 'next/link';

export default function DispatchPage() {
  return (
    <div className="min-h-screen bg-[#F5E6CC] text-[#332420] flex flex-col">
      {/* Dispatch Header */}
      <header className="border-b-4 border-[#332420] bg-[#332420] text-[#F5E6CC] p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-eatvetica text-2xl text-[#F5E6CC] uppercase hover:text-[#790D20]">
            &larr; Burgerash
          </Link>
          <span className="font-mono text-sm px-2 py-0.5 bg-[#790D20] text-[#FFFFFF] font-bold">
            DISPATCH & PACKING STATION
          </span>
        </div>
        <div className="font-mono text-xs">
          STAȚIE EXPEDIERE #01
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ready to Pack */}
        <div className="border-4 border-[#332420] bg-[#FFFFFF] p-6 shadow-[8px_8px_0px_0px_#332420]">
          <h2 className="font-eatvetica text-3xl text-[#790D20] uppercase mb-4 border-b-2 border-[#332420] pb-2">
            Comenzi de Ambalat
          </h2>
          <div className="space-y-4">
            <div className="border-2 border-[#332420] p-4 bg-[#F5E6CC]">
              <div className="flex justify-between font-mono text-xs font-bold mb-2">
                <span>COMANDĂ #1040</span>
                <span className="text-[#790D20]">RIDICARE CURIER</span>
              </div>
              <p className="font-nunito text-sm font-bold">
                Client: Andrei M. (Str. Victoriei nr. 12)
              </p>
              <div className="mt-4 flex gap-2">
                <button className="bg-[#790D20] text-[#FFFFFF] font-mono text-xs font-bold px-4 py-2 border border-[#332420]">
                  Imprimă Etichetă
                </button>
                <button className="bg-[#332420] text-[#F5E6CC] font-mono text-xs font-bold px-4 py-2">
                  Asignează Curier
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rider Queue */}
        <div className="border-4 border-[#332420] bg-[#FFFFFF] p-6 shadow-[8px_8px_0px_0px_#332420]">
          <h2 className="font-eatvetica text-3xl text-[#332420] uppercase mb-4 border-b-2 border-[#332420] pb-2">
            Curieri Disponibili
          </h2>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between items-center border-2 border-[#332420] p-3">
              <div>
                <span className="font-bold">Rider #01 (Mihai)</span>
                <span className="block text-xs text-[#790D20]">DISPONIBIL • ÎN ZONĂ</span>
              </div>
              <button className="bg-[#790D20] text-[#FFFFFF] text-xs font-bold px-3 py-1">
                Predă Comandă
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
