"use client";
import { useState, useEffect } from 'react';

// 1. Cursorul Crosshair
export const Crosshair = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div 
      className="fixed pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
    >
      <div className="w-8 h-8 border border-white/50 rounded-full flex items-center justify-center">
        <div className="w-[1px] h-4 bg-white/50 absolute"></div>
        <div className="w-4 h-[1px] bg-white/50 absolute"></div>
      </div>
      <span className="absolute top-4 left-4 font-mono text-[10px] text-white/50">
        X:{pos.x} Y:{pos.y}
      </span>
    </div>
  );
};

// 2. Textul Redacted (Secretizat)
export const Redacted = ({ children }: { children: string }) => {
  const [revealed, setRevealed] = useState(false);
  return (
    <span 
      onMouseEnter={() => setRevealed(true)}
      className={`cursor-help transition-all duration-300 ${revealed ? 'bg-transparent' : 'bg-brand-dark text-transparent'}`}
    >
      {children}
    </span>
  );
};

// 3. HUD Corners (Colțurile de ochire)
export const HUDCorners = () => (
  <>
    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-brand-dark opacity-30"></div>
    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-brand-dark opacity-30"></div>
    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-brand-dark opacity-30"></div>
    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-brand-dark opacity-30"></div>
  </>
);