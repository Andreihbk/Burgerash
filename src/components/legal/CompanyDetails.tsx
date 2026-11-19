import { ADDRESS, COMPANY_NAME, CUI, EMAIL, PHONE, REG_COM } from "@/lib/legal";

export default function CompanyDetails() {
  return (
    <ul className="list-none! pl-0! font-mono text-sm">
      <li>Denumire: {COMPANY_NAME}</li>
      <li>CUI: {CUI}</li>
      <li>Nr. Reg. Com.: {REG_COM}</li>
      <li>Sediu / adresă: {ADDRESS}</li>
      <li>Email: {EMAIL}</li>
      <li>Telefon: {PHONE}</li>
    </ul>
  );
}
