export enum EbrizaItemType {
  Product = 0,
  Tips = 1000,
  BottleDeposit = 1001,
  DeliveryFee = 1002,
  Cutlery = 1003,
}

export enum EbrizaPaymentType {
  CashOnDelivery = 0,
  Cash = 1,
  CreditCard = 2,
  BankTransfer = 3,
  Protocol = 4,
  CashWithInvoiceReceipt = 5,
  MealTickets = 6,
  FiscalProtocol = 7,
  CashNotFiscal = 8,
  Other = 9,
  CreditCardOnDelivery = 10,
}

export enum EbrizaBillStatus {
  New = 0,
  Error = 1,
  Accepted = 10,
  Canceled = 11,
  MovedOnLocation = 15,
  InPreparation = 20,
  PreparationFinished = 21,
  NonFiscalReceiptPrinted = 29,
  FiscalReceiptPrinted = 30,
  FiscalReceiptRePrinted = 31,
  PickedUp = 90,
  SentToFleetApp = 100,
  SentToFleetAppFailed = 110,
  InDelivery = 120,
  DeliveryFinished = 130,
}

export interface EbrizaTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface EbrizaItem {
  id: string;
  categoryID: string;
  categoryName: string;
  position: number;
  name: string;
  internalName?: string;
  sku: string;
  vat?: number;
  mu?: string;
  price?: number;
  unitQuantity?: number;
  image?: string;
  isCategory: boolean;
  hasProducts?: boolean;
  tags?: string[];
  isForDelivery?: boolean;
  description?: string;
  allergens?: number[];
  nutritionalInfo?: string;
}

export interface EbrizaBillItemPayload {
  id?: string;
  sku?: string;
  name?: string;
  price?: number;
  vat?: number;
  quantity: number;
  type?: EbrizaItemType;
  note?: string;
  lock?: string;
  isMod?: boolean;
}

export interface EbrizaBillPaymentPayload {
  type: EbrizaPaymentType;
  value: number;
  units?: number;
  details?: string;
}

export interface EbrizaClientAddressPayload {
  street: string;
  city: string;
  county: string;
  country: string;
  postalCode?: string;
  details?: string;
  isDeliveryAddress?: boolean;
  isInvoiceAddress?: boolean;
}

export interface EbrizaClientRequestPayload {
  email?: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: EbrizaClientAddressPayload;
  adressNeedsValidation?: boolean;
}

export interface EbrizaOpenBillWithClientPayload {
  bill: {
    userID?: string;
    roomName?: string;
    tableID?: string;
    items: EbrizaBillItemPayload[];
    payments?: EbrizaBillPaymentPayload[];
    externalOrderNo: string;
    externalOrderID: string;
    isForPickup?: boolean;
    usePreferentialPrice?: boolean;
    useProviderIntegration?: boolean;
    note?: string;
  };
  client: EbrizaClientRequestPayload;
}

export interface EbrizaWebhookCallback {
  id: string;
  ebrizaClientID: string;
  entity: 0 | 1 | 2 | 100; // 0: Order, 1: Bill, 2: Room, 100: Invoice
}