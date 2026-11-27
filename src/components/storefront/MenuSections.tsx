import { MENU_SECTIONS } from "@/lib/catalog";
import MenuItem from "./MenuItem";
import { sectionDomId } from "./ids";
import { Display } from "@/components/Display";

export default function MenuSections() {
  return (
    <div className="space-y-10 md:space-y-14">
      {MENU_SECTIONS.map(({ category, products }) => (
        <section key={category.id} id={sectionDomId(category.id)} aria-labelledby={`${sectionDomId(category.id)}-title`}>
          <div className="flex items-center gap-4 mb-4 md:mb-6">
            <h3
              id={`${sectionDomId(category.id)}-title`}
              className="font-display text-3xl md:text-4xl tracking-wide text-charcoal shrink-0"
            >
              <Display>{category.name}</Display>
            </h3>
            <div className="flex-1 h-2 border-y-2 border-charcoal" />
          </div>

          {/* Each product is rendered once: a row on phones, a sticker card from md up (see MenuItem).
              Sections of 4 (sides, drinks) get 4 columns on desktop, so no product sits alone on the last row. */}
          <ul
            className={`space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 ${
              products.length % 4 === 0 ? "lg:grid-cols-4 lg:gap-5" : "lg:grid-cols-3"
            }`}
          >
            {products.map((product) => (
              <MenuItem key={product.id} product={product} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
