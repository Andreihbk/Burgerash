// Single source for company data used on the legal pages (PLAN B.2).
// Company data from the registration certificate (ONRC, issued 22.06.2026). Email and phone
// are still to be filled in by the owner. Never invent real data here.
export const PLACEHOLDER = "[DE COMPLETAT]";

export const COMPANY_NAME = "SOLE KIDS S.R.L.";
export const CUI = "49110839";
export const REG_COM = "J2023021506409";
export const ADDRESS = "Strada Porumbacu nr. 48, parter, Sector 6, București";
export const EMAIL = "[DE COMPLETAT]";
export const PHONE = "[DE COMPLETAT]";

export const LEGAL_UPDATED = "27 noiembrie 2026";

export const ANPC_SAL_URL = "https://anpc.ro/ce-este-sal/";
export const ANPC_SOL_URL = "https://ec.europa.eu/consumers/odr";

export const ANSPDCP = {
  name: "Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)",
  address: "B-dul G-ral. Gheorghe Magheru nr. 28-30, Sector 1, București",
  site: "https://www.dataprotection.ro",
  email: "anspdcp@dataprotection.ro",
} as const;

export const TERMS_PATH = "/termeni";
export const PRIVACY_PATH = "/confidentialitate";
export const DELIVERY_PATH = "/livrare-retur";
export const ANPC_PATH = "/anpc";

export const LEGAL_LINKS = [
  { href: TERMS_PATH, label: "Termeni și condiții" },
  { href: PRIVACY_PATH, label: "Confidențialitate și cookies" },
  { href: DELIVERY_PATH, label: "Livrare, ridicare, retur" },
  { href: ANPC_PATH, label: "ANPC" },
] as const;
