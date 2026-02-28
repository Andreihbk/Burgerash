export default function Location() {
    return (
      <section id="location" className="flex flex-col md:flex-row border-b-2 border-brand-dark">
        {/* INFO SIDE */}
        <div className="flex-1 bg-brand-dark text-brand-paper p-8 md:p-16 border-b-2 md:border-b-0 md:border-r-2 border-brand-dark">
          <h2 className="font-bebas text-6xl md:text-7xl mb-6 text-brand-red">UNDE GĂSEȘTI CRUSTA</h2>
          <div className="font-mono text-lg space-y-4">
            <p>📍 Undeva în cartier, București</p>
            <p className="text-brand-metal normal-case">/// Fix lângă liceu. Urmărește mirosul de vită caramelizată pe plită.</p>
            <br />
            <p className="uppercase font-bold border-b border-brand-metal pb-2 inline-block">Programul de foc</p>
            <p>L-V: 10:00 - 22:00 <span className="text-brand-metal normal-case">(Perfect pentru pauza mare)</span></p>
            <p>S-D: 12:00 - 00:00 <span className="text-brand-metal normal-case">(Recovery mode)</span></p>
          </div>
        </div>
  
        {/* DELIVERY SIDE */}
        <div className="flex-1 bg-brand-red text-brand-paper p-8 md:p-16 flex flex-col justify-center">
          <h2 className="font-bebas text-6xl md:text-7xl mb-6">BĂGĂM ȘI PE DELIVERY.</h2>
          <p className="font-mono text-lg mb-8 max-w-md normal-case">
            Plouă? Ai meci? Nu vrei să ieși din casă? Nicio problemă. Venim noi la tine cu marfa fierbinte în mai puțin de 30 de minute.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-brand-dark text-brand-paper font-bebas text-2xl px-8 py-4 hover:bg-brand-paper hover:text-brand-dark transition-all shadow-[4px_4px_0px_0px_rgba(244,241,234,1)]">
              COMANDĂ PRIN TAZZ
            </button>
            <button className="bg-brand-paper text-brand-dark font-bebas text-2xl px-8 py-4 hover:bg-brand-dark hover:text-brand-paper hover:shadow-[4px_4px_0px_0px_rgba(244,241,234,1)] transition-all shadow-[4px_4px_0px_0px_rgba(18,18,18,1)]">
              COMANDĂ PRIN GLOVO
            </button>
          </div>
        </div>
      </section>
    );
  }