import { MENU_SECTIONS } from "@/lib/catalog";
import ProductCard from "./ProductCard";
import { sectionDomId } from "./ids";

export default function MenuSections() {
  return (
    <div className="space-y-14">
      {MENU_SECTIONS.map(({ category, products }) => (
        <section key={category.id} id={sectionDomId(category.id)} aria-labelledby={`${sectionDomId(category.id)}-title`}>
          <div className="flex items-center gap-4 mb-6">
            <h3
              id={`${sectionDomId(category.id)}-title`}
              className="font-bebas text-4xl tracking-wide text-[#332420] shrink-0"
            >
              {category.name}
            </h3>
            <div className="flex-1 h-2 border-y-2 border-[#332420]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
