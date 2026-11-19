import { BurgerStamp } from "../BurgerStamp";
import type { Product } from "@/types/database";
import ProductActions from "./ProductActions";
import { isCustomizable } from "./ids";
import { Display } from "@/components/Display";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white border-2 border-[#332420] rounded-xl p-5 flex flex-col justify-between shadow-[5px_5px_0px_0px_#332420] hover:translate-y-[-3px] transition-all relative group">
      <div>
        {/* Sticker instead of photo (photos kept in public/images/menu for later) */}
        <div className="w-full h-52 mb-4 flex items-center justify-center bg-[#F5E6CC]/50 rounded-lg border border-[#332420]/15">
          <BurgerStamp
            product={product}
            className="h-44 w-44 rotate-[-6deg] group-hover:rotate-0 transition-transform duration-300 drop-shadow-[4px_4px_0px_rgba(51,36,32,0.25)]"
          />
        </div>

        <h4 className="font-bebas text-3xl tracking-wide text-[#332420] mb-2"><Display>{product.name}</Display></h4>

        <p className="font-nunito font-bold text-sm text-[#332420]/75 mb-3">{product.description}</p>
        {product.allergens === null && (
          <p className="font-nunito text-xs text-[#332420]/60 mb-3">Alergeni: întreabă-ne</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t-2 border-[#332420]/10 mt-auto gap-2">
        <div>
          <span className="text-[10px] font-mono text-[#332420]/60 block">
            {product.weight_label ? `GRAMAJ ${product.weight_label}` : "PREȚ"}
          </span>
          <span className="font-nunito font-black text-2xl text-[#332420]">
            {product.price} <span className="text-sm font-bold">LEI</span>
          </span>
        </div>

        <ProductActions product={product} customizable={isCustomizable(product)} />
      </div>
    </div>
  );
}
