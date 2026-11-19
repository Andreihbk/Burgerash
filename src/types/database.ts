export type OrderStatus =
  | "pending"          // Comandă nouă intrată
  | "preparing"        // Pe plită în bucătărie (/kitchen)
  | "ready_for_packing"// Gata de ambalare (/dispatch)
  | "out_for_delivery" // Preluată de curier (/rider)
  | "delivered"        // Livrată / Ridicată
  | "canceled";        // Anulată

export type FulfillmentType = "delivery" | "pickup";

export type PaymentMethod = "cash_on_delivery" | "card_on_delivery" | "online_card";

export type EbrizaSyncStatus = "pending" | "sent" | "failed" | "skipped";

export interface Category {
  id: string;
  name: string;
  slug: string;
  position: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  weight_grams: number | null;
  weight_label: string | null;     // Display text from the menu board: "280g", "330ml", "6 buc (aprox. 180g)"
  image_url: string | null;
  label_text: string | null;       // Ex: "BESTSELLER", "DOUBLE SMASH", "SPICY"
  label_variant: "burgundy" | "charcoal" | "cream" | null;
  ebriza_sku: string | null;
  ebriza_id: string | null;
  allergens: string[] | null;      // null = not confirmed yet (UI: "Alergeni: întreabă-ne")
  is_available: boolean;
  is_featured: boolean;
  position: number;
}

export interface Modifier {
  id: string;
  name: string;
  group_name: "extra" | "sauce" | "remove";
  /** Categories whose products may take this modifier (burger-only extras must never reach sides/drinks). */
  category_ids: string[];
  price: number;
  ebriza_sku: string | null;
  is_available: boolean;
  position: number;
}

export interface OrderItemModifier {
  id: string;
  name: string;
  price: number;
  ebriza_sku: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null; // Catalog id (e.g. "prod-classic"), not a DB uuid
  product_name: string;
  ebriza_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  modifiers: OrderItemModifier[];
  note: string | null;
}

export interface Order {
  id: string;
  order_number: string; // Ex: "BRG-1042"
  public_token: string; // Secret for the customer status link /comanda/[token]
  status: OrderStatus;
  fulfillment_type: FulfillmentType;
  payment_method: PaymentMethod;
  is_paid: boolean;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string | null;
  delivery_details: string | null; // Bloc, scară, etaj, apartament, interfon
  order_note: string | null;
  subtotal: number;
  delivery_fee: number;
  tip_amount: number;
  total_amount: number;
  cutlery_sets: number;
  rider_name: string | null;
  ebriza_bill_id: string | null;
  ebriza_sync_status: EbrizaSyncStatus;
  ebriza_error: string | null;
  ebriza_error_code: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}