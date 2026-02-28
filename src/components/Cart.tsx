"use client";

import { useCartStore } from '@/store/cartStore';

export default function Cart() {
  const { 
    isOpen, 
    toggleCart, 
    items, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice,
    orderNote,
    setOrderNote
  } = useCartStore();

  if (!isOpen) return null;

  const currentTotal = getTotalPrice();
  const freeDeliveryThreshold = 100;
  const remainingForFreeDelivery = Math.max(freeDeliveryThreshold - currentTotal, 0);
  const progressPercentage = Math.min((currentTotal / freeDeliveryThreshold) * 100, 100);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm" 
        onClick={toggleCart} 
      />

      {/* Sertarul */}
      <div className="relative w-full md:w-[450px] bg-brand-paper h-full border-l-2 border-brand-dark flex flex-col uppercase animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <div className="p-6 border-b-2 border-brand-dark flex justify-between items-center bg-brand-red text-white shrink-0">
          <h2 className="font-bebas text-5xl">COMANDA TA</h2>
          <button 
            onClick={toggleCart} 
            className="font-mono text-2xl font-bold hover:scale-110 transition-transform"
          >
            [ X ]
          </button>
        </div>

        {/* BARA DE LIVRARE GRATUITĂ */}
        <div className="bg-[#EAE5D9] border-b-2 border-brand-dark p-4 shrink-0 font-mono text-sm text-center">
          {remainingForFreeDelivery > 0 ? (
            <p className="mb-2 text-brand-dark font-bold">
              MAI BAGĂ DE <span className="text-brand-red text-lg">{remainingForFreeDelivery} RON</span> PENTRU LIVRARE MOCA.
            </p>
          ) : (
            <p className="mb-2 text-brand-red font-bold text-lg">
              BOOM! AI LIVRARE GRATUITĂ.
            </p>
          )}
          {/* Progress Bar Brutalist */}
          <div className="w-full h-4 border-2 border-brand-dark bg-white overflow-hidden p-0.5">
            <div 
              className="h-full bg-brand-red transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* LISTA DE PRODUSE */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-brand-dark bg-brand-paper">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <span className="text-6xl mb-4">🍔</span>
              <p>COȘUL E GOL.</p>
              <p>BAGA NIȘTE CARNE PE PLITĂ.</p>
            </div>
          ) : (
            <>
              {items.map(item => (
                <div key={item.id} className="border-2 border-brand-dark p-4 flex flex-col gap-4 bg-white shadow-[2px_2px_0px_0px_rgba(18,18,18,1)]">
                   <div className="flex justify-between items-start">
                     <p className="font-bold text-lg">{item.name}</p>
                     <p className="text-brand-red font-bold whitespace-nowrap">{item.price}</p>
                   </div>
                   
                   {/* CONTROALE CANTITATE */}
                   <div className="flex justify-between items-center mt-auto">
                     <div className="flex items-center border-2 border-brand-dark">
                       <button 
                         onClick={() => updateQuantity(item.id, -1)}
                         className="px-3 py-1 bg-brand-paper hover:bg-brand-red hover:text-white transition-colors border-r-2 border-brand-dark font-bold"
                       >
                         -
                       </button>
                       <span className="px-4 py-1 font-bold">{item.quantity}</span>
                       <button 
                         onClick={() => updateQuantity(item.id, 1)}
                         className="px-3 py-1 bg-brand-paper hover:bg-brand-red hover:text-white transition-colors border-l-2 border-brand-dark font-bold"
                       >
                         +
                       </button>
                     </div>
                     <button 
                       onClick={() => removeFromCart(item.id)} 
                       className="text-brand-metal text-sm font-bold hover:text-brand-red hover:underline decoration-2 underline-offset-4"
                     >
                       ȘTERGE
                     </button>
                   </div>
                </div>
              ))}

              {/* NOTĂ PENTRU BUCĂTĂRIE */}
              <div className="pt-4">
                <label className="block font-bold text-sm mb-2">NOTĂ PENTRU BUCĂTĂRIE / LIVRATOR:</label>
                <textarea 
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Fără ceapă, interfon 42, etc..."
                  className="w-full border-2 border-brand-dark bg-white p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-red resize-none h-24 normal-case placeholder:uppercase"
                />
              </div>
            </>
          )}
        </div>

        {/* FOOTER COȘ (TOTAL & CHECKOUT) */}
        <div className="p-6 border-t-2 border-brand-dark bg-brand-paper shrink-0">
          <div className="flex justify-between items-end mb-6">
            <span className="font-mono text-xl font-bold">TOTAL:</span>
            <span className="font-bebas text-5xl text-brand-red">{currentTotal} RON</span>
          </div>
          <button 
            disabled={items.length === 0}
            className="w-full font-bebas text-3xl bg-brand-dark text-brand-paper py-5 hover:bg-brand-red transition-colors shadow-[4px_4px_0px_0px_rgba(18,18,18,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(18,18,18,1)]"
          >
            {items.length === 0 ? 'COȘUL E GOL' : 'MERGI LA CASĂ 🛒'}
          </button>
        </div>

      </div>
    </div>
  );
}