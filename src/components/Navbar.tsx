export default function Navbar() {
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
        <button className="bg-brand-dark text-brand-paper px-4 py-2 font-bebas text-lg hover:bg-brand-red transition-colors">
          CART (0)
        </button>
      </nav>
    );
  }