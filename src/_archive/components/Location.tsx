export default function Location() {
  return (
    <section id="location" className="flex flex-col md:flex-row border-b-2 border-brand-dark">
      {/* INFO SIDE */}
      <div className="flex-1 bg-brand-dark text-brand-paper p-8 md:p-16 border-b-2 md:border-b-0 md:border-r-2 border-brand-dark">
        {/* Titlu Eatvetica fără diacritice */}
        <h2 className="font-eatvetica tracking-wide text-6xl md:text-7xl mb-6 text-brand-red">
          UNDE GASESTI CRUSTA
        </h2>
        
        {/* Info cu Nunito (suportă diacritice) */}
        <div className="font-nunito font-bold text-lg space-y-4">
          <p>📍 Undeva în cartier, București</p>
          <p className="text-brand-metal normal-case">
            /// Fix lângă liceu. Urmărește mirosul de vită caramelizată pe plită.
          </p>
          <br />
          
          {/* Subtitlu Eatvetica fără diacritice */}
          <p className="font-eatvetica text-3xl tracking-wide border-b border-brand-metal pb-2 inline-block mt-2">
            PROGRAMUL DE FOC
          </p>
          <p>L-V: 10:00 - 22:00 <span className="text-brand-metal normal-case">(Perfect pentru pauza mare)</span></p>
          <p>S-D: 12:00 - 00:00 <span className="text-brand-metal normal-case">(Recovery mode)</span></p>
        </div>
      </div>

      {/* DELIVERY SIDE */}
      <div className="flex-1 bg-brand-red text-brand-paper p-8 md:p-16 flex flex-col justify-center">
        {/* Titlu Eatvetica fără diacritice */}
        <h2 className="font-eatvetica tracking-wide text-6xl md:text-7xl mb-6">
          BAGAM SI PE DELIVERY.
        </h2>
        
        {/* Descriere Nunito (suportă diacritice) */}
        <p className="font-nunito font-bold text-lg mb-8 max-w-md normal-case text-brand-paper/90">
          Plouă? Ai meci? Nu vrei să ieși din casă? Nicio problemă. Venim noi la tine cu marfa fierbinte în mai puțin de 30 de minute.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Buton Wolt */}
          <button className="bg-[#009DE0] text-white font-eatvetica tracking-wide text-3xl px-8 py-4 hover:bg-white hover:text-[#009DE0] transition-all shadow-[4px_4px_0px_0px_#005A80] hover:shadow-[4px_4px_0px_0px_rgba(18,18,18,1)]">
            COMANDA PRIN WOLT
          </button>

          {/* Buton Glovo */}
          <button className="bg-[#FFC244] text-[#121212] font-eatvetica tracking-wide text-3xl px-8 py-4 hover:bg-[#121212] hover:text-[#FFC244] transition-all shadow-[4px_4px_0px_0px_#121212] hover:shadow-[4px_4px_0px_0px_rgba(244,241,234,1)]">
            COMANDA PRIN GLOVO
          </button>
        </div>
      </div>
    </section>
  );
}