"use client";

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);
  
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    if (totalItems > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300); 
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="border-b-2 border-brand-dark p-4 md:p-6 flex justify-between items-center bg-brand-paper sticky top-0 z-50">
        
        {/* LOGO: Trecut pe Eatvetica și mărit pentru impact */}
        <span className="font-eatvetica text-4xl md:text-5xl tracking-tighter text-brand-red relative z-50 mt-1">
          burgerash
        </span>

        {/* LINK-URI DESKTOP: Eatvetica, font mai mare, fără diacritice, underline mai fin */}
        <div className="hidden md:flex gap-8 font-eatvetica text-2xl mt-1 tracking-wide">
          <a href="#menu" className="hover:underline decoration-brand-red decoration-2 underline-offset-4">Meniu</a>
          <a href="#location" className="hover:underline decoration-brand-red decoration-2 underline-offset-4">Locatie</a>
          <a href="#contact" className="hover:underline decoration-brand-red decoration-2 underline-offset-4">Contact</a>
        </div>

        {/* CONTROALE DREAPTA */}
        <div className="flex items-center gap-2 md:gap-4 relative z-50">
          <button 
            onClick={toggleCart}
            // BUTON CART: Trecut pe Eatvetica
            className={`px-3 py-1.5 md:px-4 md:py-2 font-eatvetica text-xl md:text-2xl tracking-wide transition-all duration-300 cursor-pointer mt-1 ${
              isAnimating 
                ? 'bg-brand-red text-white scale-110 shadow-[4px_4px_0px_0px_rgba(18,18,18,1)]' 
                : 'bg-brand-dark text-brand-paper hover:bg-brand-red hover:text-white'
            }`}
          >
            CART ({totalItems})
          </button>

          {/* BUTON HAMBURGER */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden flex flex-col gap-1.5 justify-center items-center w-8 h-8 cursor-pointer"
          >
            <span className={`block w-7 h-1 bg-brand-dark transition-transform duration-300 origin-center ${isMobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
            <span className={`block w-7 h-1 bg-brand-dark transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-7 h-1 bg-brand-dark transition-transform duration-300 origin-center ${isMobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
          </button>
        </div>
      </nav>

      {/* OVERLAY MENIU MOBIL */}
      <div 
        className={`fixed inset-0 bg-brand-paper z-40 flex flex-col items-center justify-center transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Linkuri overlay de mobil: Trecute pe Eatvetica și curățate de diacritice */}
        <div className="flex flex-col gap-10 font-eatvetica tracking-wide text-7xl text-brand-dark text-center uppercase">
          <a href="#menu" onClick={closeMobileMenu} className="hover:text-brand-red transition-colors">Meniu</a>
          <a href="#location" onClick={closeMobileMenu} className="hover:text-brand-red transition-colors">Locatie</a>
          <a href="#contact" onClick={closeMobileMenu} className="hover:text-brand-red transition-colors">Contact</a>
        </div>
        
        {/* Motto overlay de mobil: Mărit la text-2xl ca să dea bine */}
        <div className="absolute bottom-10 font-eatvetica text-2xl tracking-widest text-brand-metal">
          FOC. PRESA. CRUSTA. ATAT.
        </div>
      </div>
    </>
  );
}