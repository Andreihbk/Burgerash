import { MENU_SECTIONS } from "@/lib/catalog";
import ProductCard from "./ProductCard";
import ProductRow from "./ProductRow";
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
              className="font-bebas text-3xl md:text-4xl tracking-wide text-[#332420] shrink-0"
            >
              <Display>{category.name}</Display>
            </h3>
            <div className="flex-1 h-2 border-y-2 border-[#332420]" />
          </div>

          {/* Phones: compact tappable rows (app-style list). md+: the sticker cards. */}
          <ul className="md:hidden space-y-3">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </ul>

          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
