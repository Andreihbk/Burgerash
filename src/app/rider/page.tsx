import Link from 'next/link';

export default function RiderPage() {
  return (
    <div className="min-h-screen bg-[#F5E6CC] text-[#332420] flex flex-col max-w-md mx-auto border-x-4 border-[#332420]">
      {/* Rider App Header */}
      <header className="border-b-4 border-[#332420] bg-[#790D20] text-[#FFFFFF] p-4 flex justify-between items-center">
        <Link href="/" className="font-bebas text-xl uppercase text-[#FFFFFF]">
          &larr; Burgerash Rider
        </Link>
        <span className="font-mono text-xs font-bold bg-[#332420] text-[#F5E6CC] px-2 py-1">
          ONLINE
        </span>
      </header>

      {/* Active Delivery Card */}
      <main className="flex-1 p-4 space-y-4">
        <div className="border-4 border-[#332420] bg-[#FFFFFF] p-4 shadow-[6px_6px_0px_0px_#332420]">
          <div className="bg-[#790D20] text-[#FFFFFF] font-mono text-xs font-bold px-2 py-1 inline-block mb-3">
            LIVRARE ACTIVĂ #1039
          </div>

          <h2 className="font-bebas text-2xl uppercase text-[#332420] mb-2">
            Adresă Client
          </h2>
          <p className="font-nunito font-bold text-base text-[#332420] mb-4">
            Bulevardul Unirii 45, Bl. E3, Ap. 14, Sector 3
          </p>

          <div className="border-t-2 border-[#332420] pt-3 font-mono text-xs space-y-1 mb-6">
            <p><span className="font-bold">Client:</span> Ion Popescu</p>
            <p><span className="font-bold">Telefon:</span> 0722 000 111</p>
            <p><span className="font-bold">Notă:</span> Sună la interfon 14.</p>
          </div>

          <div className="space-y-2">
            <button className="w-full bg-[#790D20] text-[#FFFFFF] font-mono font-bold py-3 text-sm border-2 border-[#332420] shadow-[3px_3px_0px_0px_#332420] uppercase">
              Am Preluat Pachetul
            </button>
            <button className="w-full bg-[#332420] text-[#F5E6CC] font-mono font-bold py-3 text-sm border-2 border-[#332420] uppercase">
              Marchează Livrat &check;
            </button>
          </div>
        </div>

        {/* History / Summary */}
        <div className="border-2 border-[#332420] bg-[#FFFFFF] p-4 font-mono text-xs">
          <h3 className="font-bold text-[#790D20] uppercase mb-2">
            Sumar Tură Astăzi
          </h3>
          <div className="flex justify-between border-b border-[#332420] py-1">
            <span>Comenzi Livrate:</span>
            <span className="font-bold">8</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Castig Estimat:</span>
            <span className="font-bold">160 LEI</span>
          </div>
        </div>
      </main>
    </div>
  );
}
