import Navbar from '@/_archive/components/Navbar';
import Hero from '@/_archive/components/Hero';
import Ticker from '@/_archive/components/Ticker';
import Menu from '@/_archive/components/menu';
import Location from '@/_archive/components/Location';
import Footer from '@/_archive/components/Footer';
import Cart from '@/_archive/components/Cart';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col uppercase">
      <Cart />
      <Navbar />
      <Hero />
      <Ticker />
      <Menu />
      <Location />
      <Footer />  
     
    </div>
  );
}