export default function Footer() {
  return (
    <footer id="contact" className="bg-brand-paper text-brand-dark p-8 border-t-2 border-brand-dark flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
      
      {/* LOGO & COPYRIGHT */}
      <span className="font-eatvetica text-4xl text-brand-red tracking-wider mt-1">
        burgerash © 2020
      </span>
      
      {/* SOCIAL LINKS */}
      <div className="font-eatvetica text-3xl flex gap-8 mt-1">
        <a href="#" className="hover:text-brand-red transition-colors decoration-2 underline-offset-4 hover:underline">
          INSTAGRAM
        </a>
        <a href="#" className="hover:text-brand-red transition-colors decoration-2 underline-offset-4 hover:underline">
          TIKTOK
        </a>
      </div>
      
      {/* MOTTO */}
      <span className="font-eatvetica text-2xl text-brand-metal mt-1 tracking-wide">
        FOC. PRESA. CRUSTA.
      </span>
      
    </footer>
  );
}