import SiteHeader from "@/components/storefront/SiteHeader";
import HeroBoard from "@/components/storefront/HeroBoard";
import CategoryBar from "@/components/storefront/CategoryBar";
import OrderingBanner from "@/components/storefront/OrderingBanner";
import TodayStatus from "@/components/storefront/TodayStatus";
import MenuSections from "@/components/storefront/MenuSections";
import LocationSection from "@/components/storefront/LocationSection";
import AboutSection from "@/components/storefront/AboutSection";
import FaqSection from "@/components/storefront/FaqSection";
import InstagramStrip from "@/components/storefront/InstagramStrip";
import SiteFooter from "@/components/storefront/SiteFooter";
import AddedToast from "@/components/storefront/AddedToast";
import MobileCartBar from "@/components/storefront/MobileCartBar";
import BottomNav from "@/components/storefront/BottomNav";
import CustomizeModalHost from "@/components/storefront/CustomizeModalHost";
import CartDrawerHost from "@/components/storefront/CartDrawerHost";
import { MENU_TOP_ID } from "@/components/storefront/layout";
import { homeJsonLd } from "@/lib/structured-data";
import { Display } from "@/components/Display";

// `<` is escaped so catalog text can never close the script tag.
const jsonLd = JSON.stringify(homeJsonLd()).replace(/</g, "\\u003c");

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="min-h-screen bg-[#F5E6CC] text-[#332420] font-nunito pb-40 md:pb-24 overflow-x-clip">
        <SiteHeader />
        <HeroBoard />
        <CategoryBar />

        <main className="max-w-6xl mx-auto px-4 pt-6 pb-10">
          <OrderingBanner />
          <TodayStatus />

          <div id={MENU_TOP_ID} className="mb-8">
            <p className="font-mono text-xs font-bold tracking-widest text-[#790D20]">COMANDĂ ONLINE</p>
            <h2 className="font-bebas text-4xl sm:text-5xl text-[#332420] leading-none">
              <Display>MENIU</Display>
            </h2>
            <p className="mt-2 font-nunito font-semibold text-base text-[#332420]/70">Pregătim zilnic. Când se termină, se termină.</p>
          </div>

          <MenuSections />
          <AboutSection />
          <LocationSection />
          <FaqSection />
          <InstagramStrip />
        </main>

        <CustomizeModalHost />
        <SiteFooter />
        <AddedToast />
        <MobileCartBar />
        <BottomNav />
        <CartDrawerHost />
      </div>
    </>
  );
}
