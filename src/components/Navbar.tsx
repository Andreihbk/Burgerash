"use client";

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);
  
  // Starea care ne spune dacă butonul "sare" acum
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculăm totalul local de produse (1 burger + 2 cartofi = 3)
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // Efectul de "Pop" vizual când crește numărul de produse
  useEffect(() => {
    if (totalItems > 0) {
      setIsAnimating(true); // Declansăm animația
      // Oprim animația după 300ms ca să revină la normal
      const timer = setTimeout(() => setIsAnimating(false), 300); 
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  return (
    <nav className="border-b-2 border-brand-dark p-6 flex justify-between items-center bg-brand-paper sticky top-0 z-50">
      <span className="font-bebas text-4xl tracking-tighter text-brand-red">
        burgerash
      </span>
      <div className="hidden md:flex gap-8 font-mono text-sm font-bold">
        <a href="#menu" className="hover:underline decoration-brand-red decoration-2">Meniu</a>
        <a href="#location" className="hover:underline decoration-brand-red decoration-2">Locație</a>
        <a href="#contact" className="hover:underline decoration-brand-red decoration-2">Contact</a>
      </div>
      <button 
        onClick={toggleCart}
        // Aici e magia de CSS: dacă isAnimating e true, butonul se face roșu, mai mare și face o umbră
        className={`px-4 py-2 font-bebas text-lg transition-all duration-300 cursor-pointer ${
          isAnimating 
            ? 'bg-brand-red text-white scale-110 shadow-[4px_4px_0px_0px_rgba(18,18,18,1)]' 
            : 'bg-brand-dark text-brand-paper hover:bg-brand-red'
        }`}
      >
        CART ({totalItems})
      </button>
    </nav>
  );
}