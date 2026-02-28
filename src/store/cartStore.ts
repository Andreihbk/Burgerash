import { create } from 'zustand';

export type CartItem = {
  id: number;
  name: string;
  price: string; // Ex: "32 RON"
  quantity: number;
};

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  orderNote: string; 
  
  toggleCart: () => void;
  addToCart: (product: { id: number; name: string; price: string }) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void; //Pentru butoanele de +/-
  setOrderNote: (note: string) => void; //Salvează textul de la client
  clearCart: () => void;
  
  getTotalItems: () => number;
  getTotalPrice: () => number; //Calculează suma totală
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  orderNote: "",

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  setOrderNote: (note) => set({ orderNote: note }),

  // Adăugăm produsul, dar NU mai deschidem coșul forțat
  addToCart: (product) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { 
        items: [...state.items, { ...product, quantity: 1 }],
      };
    });
  },

  // Logica pentru butoanele de + și -
  updateQuantity: (id, delta) => {
    set((state) => {
      const updatedItems = state.items.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      }).filter(item => item.quantity > 0); // Dacă scazi sub 1, produsul dispare din coș

      return { items: updatedItems };
    });
  },

  removeFromCart: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  clearCart: () => set({ items: [], orderNote: "" }),

  getTotalItems: () => {
    const state = get();
    return state.items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    const state = get();
    return state.items.reduce((total, item) => {
      // Extragem "32" din "32 RON"
      const priceNumber = parseInt(item.price.split(' ')[0]) || 0;
      return total + (priceNumber * item.quantity);
    }, 0);
  },
}));