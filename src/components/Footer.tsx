export default function Footer() {
    return (
      <footer id="contact" className="bg-brand-paper text-brand-dark p-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
        <span className="font-bebas text-3xl text-brand-red tracking-wider">burgerash © 2026</span>
        <div className="font-mono text-sm font-bold flex gap-6">
          <a href="#" className="hover:text-brand-red transition-colors">INSTAGRAM</a>
          <a href="#" className="hover:text-brand-red transition-colors">TIKTOK</a>
        </div>
        <span className="font-mono text-xs text-brand-metal">FOC. PRESA. CRUSTA. </span>
      </footer>
    );
  }