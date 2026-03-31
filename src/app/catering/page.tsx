"use client";
import React, { useState } from 'react';
import { Crosshair, Redacted, HUDCorners } from '@/components/ui/Tactical';
import Navbar from '@/components/Navbar';

export default function CateringPage() {
  // STATE-UL MAGIC: Aici controlăm dacă efectele sunt pornite sau oprite
  const [tacticalMode, setTacticalMode] = useState(true);

  return (
    // Dacă tacticalMode e true, punem scanlines și cursorul. Dacă nu, nimic.
    <main className={`bg-brand-paper min-h-screen text-brand-dark overflow-x-hidden relative ${tacticalMode ? 'scanlines custom-cursor' : ''}`}>
      
      {/* Cursorul tactic */}
      {tacticalMode && <Crosshair />}
      <Navbar></Navbar>
      {/* TEXT VERTICAL DE MARGINE (DOSAR) */}
      {tacticalMode && (
        <div className="fixed left-2 top-0 bottom-0 flex items-center justify-center pointer-events-none z-50 mix-blend-difference text-white/30">
          <span className="font-mono text-[10px] tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            [DO NOT DUPLICATE] /// DOCUMENT REZERVAT UNITATII MOBILE /// BATCH_01
          </span>
        </div>
      )}

      {/* BUTONUL SECRET DE TOGGLE PENTRU ECHIPA (Jos-Dreapta) */}
      <button 
        onClick={() => setTacticalMode(!tacticalMode)}
        className="fixed bottom-4 right-4 z-[9999] bg-brand-dark text-brand-paper font-mono text-xs px-2 py-1 hover:bg-brand-red transition-colors border border-brand-paper/20"
      >
        [SYS: TACTICAL {tacticalMode ? 'ON' : 'OFF'}]
      </button>

      {/* 1. HERO - IMPACT TOTAL */}
      <section className="min-h-[90vh] flex flex-col justify-center p-8 md:p-16 border-b-4 border-brand-dark relative overflow-hidden">
        
        {/* GRID-UL INGINERESC (Hârtie milimetrică subtilă) */}
        {tacticalMode && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.04)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>
        )}

        {tacticalMode && <HUDCorners />}

        {/* Stampila */}
        <div className={`absolute top-10 right-10 md:right-32 rotate-12 border-4 border-brand-red p-2 font-eatvetica text-brand-red text-4xl opacity-80 md:text-6xl uppercase tracking-tighter z-10 transition-all duration-300 ${tacticalMode ? 'hover:rotate-0' : ''}`}>
          APROBAT <br /> PENTRU <br /> CONSUM
        </div>

        <h1 className={`font-eatvetica text-[15vw] md:text-[12vw] leading-[0.8] italic uppercase relative z-10 ${tacticalMode ? 'glitch-hover' : ''}`}>
          VENIM. <br />
          INCINGEM. <br />
          <span className="text-brand-red">PLECAM.</span>
        </h1>
        
        <div className="mt-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
          <p className="font-nunito font-black text-2xl md:text-3xl max-w-xl leading-tight bg-brand-paper/80 p-2">
            /// OPERATIUNEA {tacticalMode ? <Redacted>EVENIMENTE BURGERASH</Redacted> : <span className="text-brand-red">EVENIMENTE BURGERASH</span>}. <br />
            FARA FETE DE MASA DIN SATIN. DOAR FOC, VITA SI CRUSTA ETANSA.
          </p>
          <div className="font-eatvetica text-xl tracking-widest text-brand-metal flex items-center gap-2">
            {tacticalMode && <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>}
            COD DE UNITATE: BA-EV-2026
          </div>
        </div>
      </section>

      {/* BANDA DE AVERTIZARE (DANGER TAPE) */}
      {tacticalMode && (
        <div className="bg-brand-dark text-brand-paper transform -rotate-1 scale-105 py-2 overflow-hidden whitespace-nowrap z-30 relative border-y-4 border-brand-red shadow-xl">
          <div className="animate-marquee font-eatvetica text-3xl tracking-widest">
            /// AVERTIZARE: ZONA DE FOC DESCHIS /// PERICOL DE ARSURI /// RESTRICTED AREA /// AVERTIZARE: ZONA DE FOC DESCHIS /// PERICOL DE ARSURI /// RESTRICTED AREA /// AVERTIZARE: ZONA DE FOC DESCHIS /// PERICOL DE ARSURI /// RESTRICTED AREA ///
          </div>
        </div>
      )}

      {/* 2. ARSENALUL TACTIC (MISSION BRIEFINGS CU INFORMATII REALE) */}
      <section className="flex flex-col border-b-4 border-brand-dark relative z-20">
        
        {/* === PACHETUL 1: UNITATEA MOBILA === */}
        <div className="flex flex-col md:flex-row border-b-4 border-brand-dark">
          {/* Partea Vizuală (Poza) */}
          <div className={`w-full md:w-1/2 relative group overflow-hidden h-[400px] md:h-auto border-b-4 md:border-b-0 md:border-r-4 border-brand-dark ${tacticalMode ? 'cursor-none' : ''}`}>
            <div className={`absolute inset-0 bg-[url('/images/img-unitate-mobila.png')] bg-cover bg-center transition-all duration-500 z-0 ${tacticalMode ? 'grayscale blur-md opacity-30 group-hover:grayscale-0 group-hover:blur-0 group-hover:opacity-100' : 'opacity-80'}`}></div>
            
            {tacticalMode && (
              <>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-none z-20 pointer-events-none">
                  <div className="absolute top-4 left-4 w-12 h-12 border-t-8 border-l-8 border-brand-red"></div>
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-8 border-r-8 border-brand-red"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-b-8 border-l-8 border-brand-red"></div>
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-b-8 border-r-8 border-brand-red"></div>
                  <div className="absolute inset-0 group-hover:animate-flash"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-10 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                  <span className="font-eatvetica text-4xl text-brand-dark border-4 border-brand-dark p-4 rotate-[-5deg] bg-white/50 backdrop-blur-sm">RESTRICTED VISUAL</span>
                </div>
              </>
            )}
          </div>

          {/* Partea de Informații Reale (Tech Specs) */}
          <div className="w-full md:w-1/2 bg-brand-paper p-8 md:p-12 flex flex-col justify-center relative">
            {tacticalMode && <div className="absolute top-4 right-4 font-mono text-xs text-brand-metal">DOC_ID: BA-UM-01</div>}
            
            <span className="font-eatvetica text-2xl text-brand-red mb-2 block">01. BACKYARD TAKEOVER</span>
            <h2 className="font-eatvetica text-6xl md:text-7xl leading-none mb-8">UNITATEA <br/> MOBILA</h2>
            
            <div className="flex flex-col gap-4 font-nunito text-lg">
              <div className="border-b-2 border-brand-dark/20 pb-2">
                <span className="font-black">/// CAPACITATE:</span> 50 - 150 COMBATANȚI (Persoane)
              </div>
              <div className="border-b-2 border-brand-dark/20 pb-2">
                <span className="font-black">/// LOGISTICA INCLUSA:</span> Setup complet cu grătar industrial de inox, cort de protecție, masă de asamblare și 2-3 operatori (bucătari).
              </div>
              <div className="border-b-2 border-brand-dark/20 pb-2">
                <span className="font-black">/// CE PRIMESTI:</span> Show de foc live în curtea ta. Burgerii sunt făcuți la minut, direct în fața invitaților. Miros de fum, crustă perfectă, vibe de festival privat.
              </div>
              <div className="pb-2">
                <span className="font-black">/// CONDITII:</span> Avem nevoie de acces la priză (220V) și un spațiu de minim 4x4 metri în aer liber. Venim cu 2 ore înainte de servire.
              </div>
            </div>
          </div>
        </div>

        {/* === PACHETUL 2: OFFICE RAID === */}
        <div className="flex flex-col md:flex-row-reverse">
          {/* Partea Vizuală (Poza) */}
          <div className={`w-full md:w-1/2 relative group overflow-hidden h-[400px] md:h-auto border-b-4 md:border-b-0 md:border-l-4 border-brand-dark ${tacticalMode ? 'cursor-none' : ''}`}>
            <div className={`absolute inset-0 bg-[url('/images/img-cutii.png')] bg-cover bg-center transition-all duration-500 z-0 ${tacticalMode ? 'grayscale blur-md opacity-30 group-hover:grayscale-0 group-hover:blur-0 group-hover:opacity-100' : 'opacity-80'}`}></div>
            
            {tacticalMode && (
              <>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-none z-20 pointer-events-none">
                  <div className="absolute top-4 left-4 w-12 h-12 border-t-8 border-l-8 border-brand-red"></div>
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-8 border-r-8 border-brand-red"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-b-8 border-l-8 border-brand-red"></div>
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-b-8 border-r-8 border-brand-red"></div>
                  <div className="absolute inset-0 group-hover:animate-flash"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-10 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                  <span className="font-eatvetica text-4xl text-brand-dark border-4 border-brand-dark p-4 rotate-[5deg] bg-white/50 backdrop-blur-sm">CLASSIFIED VISUAL</span>
                </div>
              </>
            )}
          </div>

          {/* Partea de Informații Reale (Tech Specs) */}
          <div className="w-full md:w-1/2 bg-brand-paper p-8 md:p-12 flex flex-col justify-center relative">
            {tacticalMode && <div className="absolute top-4 left-4 font-mono text-xs text-brand-metal">DOC_ID: BA-OR-02</div>}
            
            <span className="font-eatvetica text-2xl text-brand-dark mb-2 block">02. TACTICAL SUPPLY</span>
            <h2 className="font-eatvetica text-6xl md:text-7xl leading-none mb-8">OFFICE <br/> RAID</h2>
            
            <div className="flex flex-col gap-4 font-nunito text-lg">
              <div className="border-b-2 border-brand-dark/20 pb-2">
                <span className="font-black">/// CAPACITATE:</span> 20 - 50 COMBATANȚI (Persoane)
              </div>
              <div className="border-b-2 border-brand-dark/20 pb-2">
                <span className="font-black">/// LOGISTICA INCLUSA:</span> Livrare masivă folosind cutii termo-izolante tactice. Păstrează temperatura și textura exact ca la ieșirea de pe plită.
              </div>
              <div className="border-b-2 border-brand-dark/20 pb-2">
                <span className="font-black">/// CE PRIMESTI:</span> Un team-building unde chiar se mănâncă bine. Burgerii ajung etichetați, calzi, gata de împărțit în sala de ședințe. Fără bătăi de cap, doar masă grea.
              </div>
              <div className="pb-2">
                <span className="font-black">/// CONDITII:</span> Comanda trebuie confirmată cu minim 48h înainte. Ideal pentru prânzuri corporate sau lansări de proiecte în birou.
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 3. PROTOCOALE DE DESANT */}
      <section className="p-8 md:p-16 border-b-4 border-brand-dark flex flex-col md:flex-row gap-16 relative">
        <div className="flex-1">
          <h2 className="font-eatvetica text-7xl md:text-8xl mb-12">PROTOCOALE</h2>
          <div className="space-y-12">
            {[
              { n: "01", t: "CONTACTUL", d: "Ne spui unde e baza și câți gura-căscată sunt de hrănit." },
              { n: "02", t: "RECOGNOSCEREA", d: "Stabilim meniul și logistica. Nu facem compromisuri." },
              { n: "03", t: "DESANTUL", d: "Venim cu 60 de minute înainte de ora H. Incingem plita." },
              { n: "04", t: "EXTRACTIA", d: "Plecăm și lăsăm doar tăvile goale. Misiune îndeplinită." },
            ].map((p) => (
              <div key={p.n} className="flex gap-6 border-l-4 border-brand-red pl-6">
                <span className="font-eatvetica text-4xl text-brand-red">{p.n}</span>
                <div>
                  <h3 className="font-eatvetica text-3xl mb-2">{p.t}</h3>
                  <p className="font-nunito font-bold text-brand-metal">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRAFICA BLUEPRINT */}
        <div className="flex-1 border-4 border-dashed border-brand-metal p-8 flex flex-col justify-center bg-white/50 relative">
          <div className="font-eatvetica text-sm absolute top-2 left-2 text-brand-metal">TECH_SPEC_V1.PDF</div>
          <div className="space-y-4">
             <div className="h-2 w-full bg-brand-dark"></div>
             <div className="h-2 w-3/4 bg-brand-red"></div>
             <div className="h-2 w-1/2 bg-brand-dark"></div>
             <div className="py-8 font-eatvetica text-4xl text-center border-y-2 border-brand-dark my-8">
                NO BULLSHIT <br /> 100% VITA <br /> CRUSTA REALA
             </div>
             <div className="flex justify-between font-mono text-xs text-brand-metal">
                <span>44.4231° N</span>
                <span>26.1025° E</span>
             </div>
          </div>
        </div>
      </section>

      {/* 4. FORMULAR */}
      <section className="p-8 md:p-16 max-w-5xl mx-auto relative">
        {tacticalMode && <HUDCorners />}
        <h2 className="font-eatvetica text-6xl mb-12 text-center underline decoration-brand-red underline-offset-8 mt-4 relative z-10">RAPORT DE INCIDENT</h2>
        
        <form className="grid grid-cols-1 md:grid-cols-2 gap-12 font-nunito font-black relative z-10">
          {/* Inputs ... */}
          <div className="space-y-2">
            <label className="text-sm">LOCATIA VIZATA</label>
            <input type="text" className={`w-full bg-transparent border-b-4 border-brand-dark p-2 focus:border-brand-red outline-none uppercase placeholder:opacity-30 ${tacticalMode ? 'cursor-none' : ''}`} />
          </div>
          <div className="space-y-2">
            <label className="text-sm">NUMAR DE COMBATANTI</label>
            <input type="number" className={`w-full bg-transparent border-b-4 border-brand-dark p-2 focus:border-brand-red outline-none uppercase placeholder:opacity-30 ${tacticalMode ? 'cursor-none' : ''}`} />
          </div>
          <div className="space-y-2">
            <label className="text-sm">DATA ATACULUI</label>
            <input type="date" className={`w-full bg-transparent border-b-4 border-brand-dark p-2 focus:border-brand-red outline-none uppercase ${tacticalMode ? 'cursor-none' : ''}`} />
          </div>
          <div className="space-y-2">
            <label className="text-sm">ALTE DETALII CRITICE</label>
            <input type="text" className={`w-full bg-transparent border-b-4 border-brand-dark p-2 focus:border-brand-red outline-none uppercase placeholder:opacity-30 ${tacticalMode ? 'cursor-none' : ''}`} />
          </div>
          
          <button className={`md:col-span-2 bg-brand-red text-white font-eatvetica text-5xl py-8 shadow-[8px_8px_0px_0px_rgba(18,18,18,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-tighter mt-8 ${tacticalMode ? 'cursor-none' : ''}`}>
            SOLICITA DESANTUL
          </button>
        </form>
      </section>

    </main>
  );
}