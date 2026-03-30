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
          Nu facem povești, facem crustă. Burger-ul care a cucerit cartierul. Carne. Foc. Chiflă. Atât.
        </p>
       
        {/* BUTOANE DELIVERY */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
          <a 
            href="#tazz-link" // Aici vei pune link-ul real de la Tazz mai târziu
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block text-center bg-brand-red text-white font-bebas text-3xl px-10 py-4 hover:bg-brand-dark transition-all transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(18,18,18,1)]"
          >
            COMANDĂ PE TAZZ
          </a>
          <a 
            href="#glovo-link" // Aici vei pune link-ul real de la Glovo
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-center bg-[#FFC244] text-[#121212] font-bebas text-3xl px-10 py-4 hover:bg-white transition-all transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(18,18,18,1)] border-2 border-transparent hover:border-brand-dark"
          >
            COMANDĂ PE GLOVO
          </a>
        </div>
      </div>

      {/* VIDEO SIDE (Fostul Image Side) */}
      <div className="flex-1 relative overflow-hidden min-h-[400px] border-brand-dark">
        <video
          src="/videos/hero-video.mp4" 
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full absolute inset-0"
        />
      </div>
    </section>
  );
}