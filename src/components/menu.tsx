"use client";

import { useCartStore } from '@/store/cartStore';

const menuItems = [
  // BURGERI
  { 
    id: 1, 
    name: "CLASSIC", 
    price: "36 RON", 
    desc: "100% Vită proaspătă, cheddar matur, castraveți murați, sosul casei. Clasic și corect.", 
    tag: "POPULAR", 
    image: "/images/menu/classic.png" 
  },
  { 
    id: 2, 
    name: "DOUBLE TROUBLE", 
    price: "43 RON", 
    desc: "2x Vită suculentă, dublu cheddar, ceapă, muștar, ketchup. Mai multă carne, mai multă treabă.", 
    image: "/images/menu/double.png" 
  },
  { 
    id: 3, 
    name: "THE NEIGHBOR", 
    price: "46 RON", 
    desc: "2x Vită, dublu cheddar, munți de bacon crocant, sos BBQ. Pentru băieții grei.", 
    image: "/images/menu/chapo.png" 
  },
  { 
    id: 4, 
    name: "HOTBOY", 
    price: "40 RON", 
    desc: "Vită proaspătă, cheddar, dulceață de ardei iute, jalapenos, mayo. Arde, dar îți place.", 
    tag: "HOT 🔥", 
    image: "/images/menu/hotboy.png" 
  },
  { 
    id: 5, 
    name: "CRISPY CHICKEN", 
    price: "36 RON", 
    desc: "Pui tăvălit prin unt și prăjit crocant, salată coleslaw proaspătă, castraveți murați.", 
    tag: "NOU", 
    image: "/images/menu/chicken.png" // Asigură-te că pui o poză cu numele ăsta în folder
  },
  { 
    id: 6, 
    name: "VEGGIE HONEST", 
    price: "32 RON", 
    desc: "Chiftea plant-based cinstită, cheddar, roșie, salată verde, sosul casei. Fără carne, mult gust.", 
    image: "/images/menu/veggie.png" 
  },
  // SIDES
  { 
    id: 7, 
    name: "DIRTY FRIES", 
    price: "18 RON", 
    desc: "Cartofi dublu prăjiți, sos fierbinte de brânză, bacon bites presărat.", 
    image: "/images/menu/dirty.png" 
  },
  { 
    id: 8, 
    name: "SIMPLY FRIES", 
    price: "12 RON", 
    desc: "Cartofi prăjiți în stil clasic, sare de mare. Simplu și curat.", 
    image: "/images/menu/fries.png"  
  },
  // DRINKS
  { 
    id: 9, 
    name: "COLA LA STICLA", 
    price: "10 RON", 
    desc: "Clasica sticlă de sticlă de 250ml. Rece gheață, cum trebuie." 
  },
  { 
    id: 10, 
    name: "BERE DE CARTIER", 
    price: "18 RON", 
    desc: "O bere artizanală locală (IPA), super aromată, rece ca gheața." 
  },
];

export default function Menu() {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <section id="menu" className="bg-brand-paper p-8 md:p-16 border-b-2 border-brand-dark">
      <div className="flex justify-between items-end mb-12 border-b-2 border-brand-dark pb-4">
        <h2 className="font-eatvetica tracking-wide text-6xl md:text-7xl text-brand-dark">MENIUL HONEST</h2>
        <span className="font-nunito font-bold tracking-widest text-brand-red hidden md:block">/// DELIVERY GATA IN 15 MINUTE</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-brand-dark border-2 border-brand-dark">
        {/* Am scos 'index' pentru că acum aplicăm designul peste tot la fel */}
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
            className="bg-brand-paper group cursor-pointer p-6 md:p-8 flex flex-col justify-between hover:bg-[#D9D1BF] active:bg-[#C9C1AF] transition-colors relative"
          >
            <div className="pointer-events-none flex-1 flex flex-col">
              
              {item.image && (
                <div className="w-full h-48 md:h-56 mb-6 flex items-center justify-center overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-contain drop-shadow-[8px_8px_0px_rgba(18,18,18,0.15)] group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  {/* Titlul cu Eatvetica */}
                  <h3 className="font-eatvetica tracking-wide text-4xl md:text-5xl text-brand-dark">
                    {item.name}
                  </h3>
                  {/* Badge-ul cu Eatvetica */}
                  {item.tag && (
                    <span className="self-start font-eatvetica text-sm tracking-widest bg-brand-red text-white px-2 py-1 shadow-[2px_2px_0px_0px_rgba(18,18,18,1)]">
                      {item.tag}
                    </span>
                  )}
                </div>
                {/* Prețul cu Nunito gros */}
                <span className="font-nunito font-black text-xl md:text-2xl bg-brand-dark text-brand-paper px-2 py-1 shrink-0">{item.price}</span>
              </div>
              
              {/* Descrierea cu Nunito (cu diacritice) */}
              <p className="font-nunito font-bold text-base normal-case text-brand-dark/80 mb-6 max-w-[80%]">
                {item.desc}
              </p>
            </div>
            
            {/* Buton Eatvetica curățat de diacritice */}
            <span className="self-start font-eatvetica tracking-wide text-2xl text-brand-red group-hover:text-brand-dark underline decoration-2 underline-offset-4 transition-colors pointer-events-none mt-auto">
              + ADAUGA IN COS
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}