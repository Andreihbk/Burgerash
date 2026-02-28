import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Ticker from '@/components/Ticker';
import Menu from '@/components/menu';
import Location from '@/components/Location';
import Footer from '@/components/Footer';
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col uppercase">
      <Navbar />
      <Hero />
      <Ticker />
      <Menu />
      <Location />
      <Footer />  
     
    </div>
  );
}