import Image from 'next/image';

export default function Hero() {
  return (
    <section className="flex flex-col md:flex-row border-b-2 border-brand-dark min-h-[85vh]">
      {/* TEXT SIDE */}
      <div className="flex-1 p-8 md:p-16 flex flex-col justify-center border-b-2 md:border-b-0 md:border-r-2 border-brand-dark bg-brand-paper relative z-10">
        <h1 className="font-bebas text-7xl md:text-9xl leading-[0.8] mb-6 text-brand-dark italic">
        <span className="text-brand-red">Foc</span> <br />
          Presa. <br />
          <span className="text-brand-red">CRUSTĂ</span> <br />
          Atat.
        </h1>
        <p className="font-mono text-lg mb-8 max-w-md normal-case leading-tight">
          Nu facem povești, facem crustă. Smash burger-ul care a cucerit cartierul. Carne. Foc. Chiflă. Atât.
        </p>
       
        <div className="flex flex-wrap gap-4">
            <a 
              href="#menu"
              className="inline-block text-center bg-brand-red text-white font-bebas text-3xl px-10 py-4 hover:bg-brand-dark transition-all transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(18,18,18,1)]"
            >
              COMANDĂ ACUM
            </a>
          </div>
      </div>

      {/* IMAGE SIDE */}
      <div className="flex-1 relative overflow-hidden min-h-[400px] border-brand-dark">
        <Image
          src="/images/burger-hero.png" 
          alt="Smash burger on a steel tray"
          fill
          className="object-cover"
          priority 
        />
      </div>
    </section>
  );
}