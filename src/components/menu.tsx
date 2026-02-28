
const menuItems = [
    { id: 1, name: "CLASSIC SMASH", price: "32 RON", desc: "2x Smash vită, dublu cheddar matur, castraveți murați, sosul casei." },
    { id: 2, name: "VIPER CHILI", price: "36 RON", desc: "2x Smash vită, cheddar, dulceață de ardei iute, jalapenos, mayo." },
    { id: 3, name: "THE NEIGHBORHOOD", price: "45 RON", desc: "3x Smash vită, triplu cheddar, bacon crocant, inele de ceapă." },
    { id: 4, name: "DIRTY FRIES", price: "18 RON", desc: "Cartofi dublu prăjiți, sos fierbinte de brânză, bacon bites presărat." },
  ];
  
  export default function Menu() {
    return (
      <section id="menu" className="bg-brand-paper p-8 md:p-16 border-b-2 border-brand-dark">
        <div className="flex justify-between items-end mb-12 border-b-2 border-brand-dark pb-4">
          <h2 className="font-bebas text-6xl text-brand-dark">MENIUL HONEST</h2>
          <span className="font-mono text-brand-red hidden md:block">/// DELIVERY GATA ÎN 25 MINUTE</span>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-0 border-2 border-brand-dark">
          {menuItems.map((item, index) => (
            <div 
              key={item.id} 
              className={`p-6 md:p-8 flex flex-col justify-between hover:bg-[#EAE5D9] transition-colors ${
                index % 2 === 0 ? 'md:border-r-2 border-brand-dark' : ''
              } ${index < menuItems.length - 2 ? 'border-b-2 border-brand-dark' : ''} ${
                index === menuItems.length - 2 && menuItems.length % 2 === 0 ? 'border-b-2 md:border-b-0 border-brand-dark' : ''
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bebas text-4xl text-brand-dark">{item.name}</h3>
                  <span className="font-mono text-xl bg-brand-dark text-brand-paper px-2 py-1">{item.price}</span>
                </div>
                <p className="font-mono text-sm normal-case text-brand-dark/80 mb-6 max-w-[80%]">
                  {item.desc}
                </p>
              </div>
              <button className="self-start font-bebas text-xl text-brand-red hover:text-brand-dark underline decoration-2 underline-offset-4 transition-colors">
                + ADAUGĂ ÎN COȘ
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  }