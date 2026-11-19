import type { Product } from "@/types/database";

export const sectionDomId = (categoryId: string) => `meniu-${categoryId}`;

export const isCustomizable = (product: Product) =>
  product.category_id === "cat-burgers" || product.category_id === "cat-chicken";
