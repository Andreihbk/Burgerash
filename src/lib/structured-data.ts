// schema.org Restaurant JSON-LD for the storefront, built from catalog.ts and hours.ts (no hand-kept copy).
import { MENU_SECTIONS } from "./catalog";
import { CONTACT, HOURS, formatTime } from "./hours";
import { SITE_ADDRESS, SITE_COORDS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

const MAIN_CATEGORIES = ["cat-burgers", "cat-chicken"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Closing at midnight is written 23:59 (schema.org/Google convention), not 00:00.
const closeTime = (minutes: number) => (minutes >= 1440 ? "23:59" : formatTime(minutes));

function openingHours() {
  const groups = new Map<string, { opens: string; closes: string; days: string[] }>();
  HOURS.forEach((h, day) => {
    const opens = formatTime(h.open);
    const closes = closeTime(h.close);
    const key = `${opens}-${closes}`;
    const group = groups.get(key) ?? { opens, closes, days: [] };
    group.days.push(DAY_NAMES[day]);
    groups.set(key, group);
  });
  return [...groups.values()].map((g) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: g.days,
    opens: g.opens,
    closes: g.closes,
  }));
}

export function restaurantJsonLd() {
  // Price range = the mains (burgers + chicken), not drinks/sauces.
  const burgerPrices = MENU_SECTIONS.filter((s) => MAIN_CATEGORIES.includes(s.category.id))
    .flatMap((s) => s.products)
    .map((p) => p.price);

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/opengraph-image`,
    description: SITE_DESCRIPTION,
    servesCuisine: ["Burgeri", "Burgers", "Fast food"],
    ...(burgerPrices.length && {
      priceRange: `${Math.min(...burgerPrices)}-${Math.max(...burgerPrices)} RON`,
    }),
    currenciesAccepted: "RON",
    paymentAccepted: "Cash, Card",
    acceptsReservations: false,
    areaServed: { "@type": "Place", name: "Sector 6, București" },
    ...(CONTACT.phone && { telephone: CONTACT.phone }),
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_ADDRESS.street,
      addressLocality: SITE_ADDRESS.city,
      addressRegion: SITE_ADDRESS.sector,
      addressCountry: "RO",
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE_COORDS.lat, longitude: SITE_COORDS.lng },
    openingHoursSpecification: openingHours(),
    hasMenu: {
      "@type": "Menu",
      name: "Meniu Burgerash",
      hasMenuSection: MENU_SECTIONS.map(({ category, products }) => ({
        "@type": "MenuSection",
        name: category.name,
        hasMenuItem: products.map((p) => ({
          "@type": "MenuItem",
          name: p.name,
          ...(p.description && { description: p.description }),
          offers: { "@type": "Offer", price: p.price, priceCurrency: "RON" },
        })),
      })),
    },
  };
}
