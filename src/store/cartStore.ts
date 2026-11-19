import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FulfillmentType, OrderItemModifier, Product } from "@/types/database";
import { getDeliveryFee } from "@/lib/pricing";
import { reconcileCartItems } from "@/lib/cart-reconcile";

export interface CartLineItem {
  cartItemId: string; // Hash unic produs + modificatori + notă
  product: Product;
  quantity: number;
  modifiers: OrderItemModifier[];
  note: string;
  unitPriceWithModifiers: number;
}

interface CartState {
  items: CartLineItem[];
  isOpen: boolean;
  fulfillmentType: FulfillmentType;
  cutlerySets: number;
  tipAmount: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setFulfillmentType: (type: FulfillmentType) => void;
  setCutlerySets: (sets: number) => void;
  setTipAmount: (tip: number) => void;
  addItem: (product: Product, modifiers?: OrderItemModifier[], note?: string, quantity?: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItemsCount: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getGrandTotal: () => number;
}


function buildCartItemId(productId: string, modifiers: OrderItemModifier[], note: string): string {
  const modKey = modifiers
    .map((m) => m.id)
    .sort()
    .join(",");
  const cleanNote = note.trim().toLowerCase();
  return `${productId}__${modKey}__${cleanNote}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      fulfillmentType: "delivery",
      cutlerySets: 0,
      tipAmount: 0,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setFulfillmentType: (type) => set({ fulfillmentType: type }),
      setCutlerySets: (sets) => set({ cutlerySets: Math.max(0, sets) }),
      setTipAmount: (tip) => set({ tipAmount: Math.max(0, tip) }),

      addItem: (product, modifiers = [], note = "", quantity = 1) => {
        const cartItemId = buildCartItemId(product.id, modifiers, note);
        const modifiersTotal = modifiers.reduce((sum, m) => sum + Number(m.price || 0), 0);
        const unitPriceWithModifiers = Number(product.price) + modifiersTotal;

        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.cartItemId === cartItemId);
          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity,
            };
            return { items: updated };
          }

          return {
            items: [
              ...state.items,
              {
                cartItemId,
                product,
                quantity,
                modifiers,
                note: note.trim(),
                unitPriceWithModifiers,
              },
            ],
          };
        });
      },

      removeItem: (cartItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== cartItemId),
        })),

      updateQuantity: (cartItemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.cartItemId !== cartItemId) };
          }
          return {
            items: state.items.map((i) =>
              i.cartItemId === cartItemId ? { ...i, quantity } : i
            ),
          };
        }),

      clearCart: () => set({ items: [], tipAmount: 0, cutlerySets: 0 }),

      getTotalItemsCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.unitPriceWithModifiers * item.quantity,
          0
        );
      },

      getDeliveryFee: () => {
        const { fulfillmentType, getSubtotal } = get();
        return getDeliveryFee(getSubtotal(), fulfillmentType);
      },

      getGrandTotal: () => {
        const { getSubtotal, getDeliveryFee, tipAmount } = get();
        const subtotal = getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal + getDeliveryFee() + tipAmount;
      },
    }),
    {
      name: "burgerash-cart-v3", // v3: DUBLE renamed to DOUBLE; drops stale carts
      // Runs on every load: quietly drops products removed from the menu and refreshes prices.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<CartState>;
        return { ...current, ...saved, items: reconcileCartItems<CartLineItem>(saved.items) };
      },
      partialize: (state) => ({
        items: state.items,
        fulfillmentType: state.fulfillmentType,
        cutlerySets: state.cutlerySets,
        tipAmount: state.tipAmount,
      }),
    }
  )
);