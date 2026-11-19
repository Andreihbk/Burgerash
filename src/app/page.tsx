import SiteHeader from "@/components/storefront/SiteHeader";
import HeroBoard from "@/components/storefront/HeroBoard";
import CategoryBar from "@/components/storefront/CategoryBar";
import TodayStatus from "@/components/storefront/TodayStatus";
import MenuSections from "@/components/storefront/MenuSections";
import LocationSection from "@/components/storefront/LocationSection";
import SiteFooter from "@/components/storefront/SiteFooter";
import AddedToast from "@/components/storefront/AddedToast";
import MobileCartBar from "@/components/storefront/MobileCartBar";
import CustomizeModalHost from "@/components/storefront/CustomizeModalHost";
import CartDrawerHost from "@/components/storefront/CartDrawerHost";
import { MENU_TOP_ID } from "@/components/storefront/layout";
import { restaurantJsonLd } from "@/lib/structured-data";

// `<` is escaped so catalog text can never close the script tag.
const jsonLd = JSON.stringify(restaurantJsonLd()).replace(/</g, "\\u003c");

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="min-h-screen bg-[#F5E6CC] text-[#332420] font-nunito pb-24">
        <SiteHeader />
        <HeroBoard />
        <CategoryBar />

        <main className="max-w-6xl mx-auto px-4 pt-6 pb-10">
          <TodayStatus />

          <div id={MENU_TOP_ID} className="mb-8">
            <p className="font-mono text-xs font-bold tracking-widest text-[#790D20]">COMANDĂ ONLINE</p>
            <h2 className="font-bebas text-5xl sm:text-6xl tracking-wide text-[#332420] leading-none">
              MENIU
            </h2>
          </div>

          <MenuSections />
          <LocationSection />
        </main>

        <CustomizeModalHost />
        <SiteFooter />
        <AddedToast />
        <MobileCartBar />
        <CartDrawerHost />
      </div>
    </>
  );
}
