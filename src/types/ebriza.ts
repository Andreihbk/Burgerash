// Ebriza POS API types. Source of truth: .claude/skills/ebriza-api/reference.md
// Only fields documented there are modelled here.

/** System line types (name/price/sku sent with these are ignored; amounts go in quantity). */
export const EbrizaItemType = {
  Tips: 1000,
  BottleDeposit: 1001,
  DeliveryFee: 1002,
  Cutlery: 1003,
} as const;
export type EbrizaItemType = (typeof EbrizaItemType)[keyof typeof EbrizaItemType];

export const EbrizaPaymentType = {
  CashOnDelivery: 0,
  Cash: 1,
  CreditCard: 2,
  BankTransfer: 3,
  Protocol: 4,
  CashWithInvoiceReceipt: 5,
  MealTickets: 6,
  FiscalProtocol: 7,
  CashNotFiscal: 8,
  Other: 9,
  CreditCardOnDelivery: 10,
} as const;
export type EbrizaPaymentType = (typeof EbrizaPaymentType)[keyof typeof EbrizaPaymentType];

export const EbrizaBillStatus = {
  New: 0,
  Error: 1,
  Accepted: 10,
  Canceled: 11,
  MovedOnLocation: 15,
  InPreparation: 20,
  PreparationFinished: 21,
  NonFiscalReceiptPrinted: 29,
  FiscalReceiptPrinted: 30,
  FiscalReceiptRePrinted: 31,
  PickedUp: 90,
  SentToFleetApp: 100,
  SentToFleetAppFailed: 110,
  InDelivery: 120,
  DeliveryFinished: 130,
} as const;
export type EbrizaBillStatus = (typeof EbrizaBillStatus)[keyof typeof EbrizaBillStatus];

export const EbrizaWebhookEntity = {
  Order: 0,
  Bill: 1,
  Room: 2,
  Invoice: 100,
} as const;
export type EbrizaWebhookEntity = (typeof EbrizaWebhookEntity)[keyof typeof EbrizaWebhookEntity];

// ---------- Auth ----------

export interface EbrizaTokenResponse {
  access_token: string;
  expires_in: number; // seconds
  token_type: string; // "bearer"
}

// ---------- openbillwithclient ----------

/** A POS product line, matched by sku or id. Modifiers share the product's lock and set isMod. */
export type EbrizaProductLine = ({ sku: string; id?: string } | { id: string; sku?: string }) & {
  quantity: number;
  lock?: string;
  isMod?: boolean;
  note?: string;
  type?: never;
};

/** Tips / DeliveryFee / Cutlery: only type + quantity. */
export interface EbrizaSystemLine {
  type: typeof EbrizaItemType.Tips | typeof EbrizaItemType.DeliveryFee | typeof EbrizaItemType.Cutlery;
  quantity: number;
}

/** BottleDeposit: attached to a product via its lock. */
export interface EbrizaBottleDepositLine {
  type: typeof EbrizaItemType.BottleDeposit;
  lock: string;
  quantity: number;
}

export type EbrizaBillItem = EbrizaProductLine | EbrizaSystemLine | EbrizaBottleDepositLine;

export interface EbrizaBillPayment {
  type: EbrizaPaymentType;
  value: number;
  units?: number;
  details?: string;
}

export interface EbrizaBillRequest {
  items: EbrizaBillItem[];
  /** Shown in POS. Required (error 0676). We send BRG-XXXX. */
  externalOrderNo: string;
  /** Our ID. We send the Supabase order UUID. */
  externalOrderID: string;
  isForPickup?: boolean;
  note?: string;
  payments?: EbrizaBillPayment[];
  preparationTime?: number;
  deliveryDate?: string;
  /** Own couriers; delivery orders only. Needs a real test before enabling. */
  useProviderIntegration?: boolean;
  usePreferentialPrice?: boolean;
  /** Omit tableID/roomName for delivery orders. */
  tableID?: string;
  roomName?: string;
}

export interface EbrizaClientAddress {
  street: string;
  city: string;
  county: string;
  country: string;
  details?: string;
  isDeliveryAddress: boolean;
}

/** At least phone or email (0110); first + last name together (0111). */
export interface EbrizaClientRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: EbrizaClientAddress;
  /** Spelling as in the Ebriza docs. */
  adressNeedsValidation?: boolean;
}

export interface EbrizaOpenBillWithClientRequest {
  bill: EbrizaBillRequest;
  client: EbrizaClientRequest;
}

// ---------- Webhooks ----------

/** Callback body. Not signed: re-fetch the resource and trust the fetch. */
export interface EbrizaWebhookCallback {
  id: string;
  ebrizaClientID: string;
  entity: EbrizaWebhookEntity;
}

// ---------- Errors ----------

export const EBRIZA_ERROR_CODES = {
  "0002": "Required field missing",
  "0099": "No POS user handles delivery orders",
  "0100": "Item not found (need id or sku)",
  "0101": "No bill found with this id",
  "0103": "New item needs name, price and VAT",
  "0104": "SKU not found and saving new items is not allowed",
  "0105": "Item missing id, sku and name",
  "0106": "Item not available for this location",
  "0109": "Product VAT not set in Ebriza",
  "0110": "Client needs phone, email or company",
  "0111": "Client first and last name required",
  "0114": "Address city required",
  "0115": "Address country required",
  "0116": "Address county required",
  "0117": "Address street required",
  "0664": "ebriza-clientid header missing",
  "0665": "Token expired or missing",
  "0668": "App not installed",
  "0669": "API claim not approved by the client",
  "0671": "App not installed on location",
  "0673": "Resource locked, retry in a few seconds",
  "0674": "Too many requests",
  "0675": "Invalid request object",
  "0676": "Missing externalOrderNo",
} as const;
export type EbrizaErrorCode = keyof typeof EBRIZA_ERROR_CODES;

/** Codes worth retrying automatically. */
export const EBRIZA_RETRYABLE_CODES: readonly string[] = ["0673", "0674"];

export type EbrizaHttpErrorKind =
  | "validation" // 400
  | "unauthorized" // 401
  | "forbidden" // 403
  | "not_found" // 404
  | "missing_client_id" // 412
  | "server" // 5xx
  | "network" // timeout / fetch failed
  | "unknown";

export type EbrizaResult<T = unknown> =
  | { ok: true; data: T; mock: boolean }
  | {
      ok: false;
      httpStatus: number | null;
      kind: EbrizaHttpErrorKind;
      errorCode: string | null;
      message: string;
      retryable: boolean;
    };

/** Normalised result of openbillwithclient. The response shape is not documented yet. */
export interface EbrizaOpenBillResult {
  /** Read from `id` if present; null otherwise (open question for the real test). */
  billId: string | null;
  raw: unknown;
}
