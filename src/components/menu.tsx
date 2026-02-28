"use client";

import { useCartStore } from '@/store/cartStore';

const menuItems = [
  // BURGERI
  { id: 1, name: "CLASSIC SMASH", price: "32 RON", desc: "2x Smash vită, dublu cheddar matur, castraveți murați, sosul casei.", tag: "POPULAR" },
  { id: 2, name: "OKLAHOMA ONION", price: "34 RON", desc: "2x Smash vită presată cu o tonă de ceapă subțire pe plită, cheddar, muștar.", tag: "NOU" },
  { id: 3, name: "VIPER CHILI", price: "36 RON", desc: "2x Smash vită, cheddar, dulceață de ardei iute, jalapenos, mayo.", tag: "HOT 🔥" },
  { id: 4, name: "THE NEIGHBORHOOD", price: "45 RON", desc: "3x Smash vită, triplu cheddar, bacon crocant, inele de ceapă." },
  // SIDES
  { id: 5, name: "DIRTY FRIES", price: "18 RON", desc: "Cartofi dublu prăjiți, sos fierbinte de brânză, bacon bites presărat." },
  { id: 6, name: "SIMPLY FRIES", price: "12 RON", desc: "Cartofi prăjiți în stil clasic, sare de mare. Simplu și curat." },
  // DRINKS
  { id: 7, name: "COLA LA STICLĂ", price: "10 RON", desc: "Clasica sticlă de sticlă de 250ml. Rece gheață, cum trebuie." },
  { id: 8, name: "BERE DE CARTIER", price: "18 RON", desc: "O bere artizanală locală (IPA), super aromată, rece ca gheața." },
];

export default function Menu() {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <section id="menu" className="bg-brand-paper p-8 md:p-16 border-b-2 border-brand-dark">
      <div className="flex justify-between items-end mb-12 border-b-2 border-brand-dark pb-4">
        <h2 className="font-bebas text-6xl text-brand-dark">MENIUL HONEST</h2>
        <span className="font-mono text-brand-red hidden md:block">/// DELIVERY GATA ÎN 15 MINUTE</span>
      </div>

      {/* Am folosit gap-[2px] și bg-brand-dark pentru a crea borduri perfecte automat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-brand-dark border-2 border-brand-dark">
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
            className="bg-brand-paper group cursor-pointer p-6 md:p-8 flex flex-col justify-between hover:bg-[#EAE5D9] active:bg-[#d5cfc1] transition-colors relative"
          >
            <div className="pointer-events-none">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h3 className="font-bebas text-4xl text-brand-dark">{item.name}</h3>
                  {/* BADGE-UL VIZUAL (Apare doar dacă produsul are un "tag") */}
                  {item.tag && (
                    <span className="self-start font-mono text-xs font-bold bg-brand-red text-white px-2 py-1 tracking-wider shadow-[2px_2px_0px_0px_rgba(18,18,18,1)]">
                      {item.tag}
                    </span>
                  )}
                </div>
                <span className="font-mono text-xl bg-brand-dark text-brand-paper px-2 py-1 shrink-0">{item.price}</span>
              </div>
              
              <p className="font-mono text-sm normal-case text-brand-dark/80 mb-6 max-w-[80%]">
                {item.desc}
              </p>
            </div>
            
            <span className="self-start font-bebas text-xl text-brand-red group-hover:text-brand-dark underline decoration-2 underline-offset-4 transition-colors pointer-events-none">
              + ADAUGĂ ÎN COȘ
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}