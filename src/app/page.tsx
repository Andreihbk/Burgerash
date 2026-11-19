import Storefront from "@/components/StoreFront";
import MenuSections from "@/components/storefront/MenuSections";
import LocationSection from "@/components/storefront/LocationSection";
import SiteFooter from "@/components/storefront/SiteFooter";
import { restaurantJsonLd } from "@/lib/structured-data";

// `<` is escaped so catalog text can never close the script tag.
const jsonLd = JSON.stringify(restaurantJsonLd()).replace(/</g, "\\u003c");

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Storefront menu={<MenuSections />} location={<LocationSection />} footer={<SiteFooter />} />
    </>
  );
}
