import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { H2 } from "@/components/legal/LegalPage";
import CompanyDetails from "@/components/legal/CompanyDetails";
import { ANPC_PATH, DELIVERY_PATH, PRIVACY_PATH } from "@/lib/legal";
import { DELIVERY_RADIUS_KM, SITE_ADDRESS } from "@/lib/site";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";

export const metadata: Metadata = { title: "Termeni și condiții", alternates: { canonical: "/termeni" } };

export default function TermeniPage() {
  return (
    <LegalPage title="Termeni și condiții">
      <p>
        Acești termeni reglementează comenzile plasate pe site-ul Burgerash (burgerash.ro). Prin plasarea unei comenzi
        confirmi că i-ai citit și că îi accepți.
      </p>

      <H2>1. Cine suntem</H2>
      <CompanyDetails />
      <p>Punct de lucru: {SITE_ADDRESS.line}, {SITE_ADDRESS.sector}.</p>

      <H2>2. Comenzi</H2>
      <ul>
        <li>Comanzi direct de pe site, fără cont. Comanda este înregistrată când primești numărul ei (BRG-XXXX).</li>
        <li>Ne rezervăm dreptul de a refuza sau anula o comandă (produs epuizat, în afara programului, adresă în afara zonei de livrare), cu anunțarea ta.</li>
        <li>Comenzile se pot plasa doar în programul afișat pe site.</li>
      </ul>

      <H2>3. Prețuri</H2>
      <p>
        Prețurile sunt exprimate în lei (RON) și includ TVA. Costul de livrare, dacă există, este afișat în coș înainte
        de a plasa comanda. Livrarea este gratuită pentru comenzi de peste {FREE_DELIVERY_THRESHOLD} lei. Prețul final
        este cel din sumarul comenzii.
      </p>

      <H2>4. Plata</H2>
      <p>
        Plata se face exclusiv online, cu cardul, prin procesatorul de plăți NETOPIA Payments. Nu acceptăm plata în
        numerar și nu stocăm datele cardului tău: introduci aceste date doar în pagina securizată a procesatorului.
      </p>

      <H2>5. Livrare și ridicare</H2>
      <p>
        Livrăm într-o rază de {DELIVERY_RADIUS_KM} km în jurul locației. Poți alege și ridicarea din restaurant.
        Detalii în pagina <Link href={DELIVERY_PATH}>Livrare, ridicare, retur</Link>.
      </p>

      <H2>6. Alergeni</H2>
      <p>
        Fiecare produs afișează alergenii cunoscuți. Produsele sunt preparate într-o bucătărie în care se manipulează
        gluten, lapte, ouă, muștar și alți alergeni, deci nu putem exclude urme de alergeni. Dacă ai o alergie sau o
        intoleranță, spune-ne înainte de comandă.
      </p>

      <H2>7. Anulare și retur</H2>
      <p>
        Condițiile de anulare, precum și excepția de la dreptul de retragere pentru produsele perisabile, sunt în pagina{" "}
        <Link href={DELIVERY_PATH}>Livrare, ridicare, retur</Link>.
      </p>

      <H2>8. Date personale</H2>
      <p>
        Prelucrăm datele tale conform <Link href={PRIVACY_PATH}>Politicii de confidențialitate</Link>.
      </p>

      <H2>9. Răspundere</H2>
      <p>
        Depunem toate eforturile ca informațiile de pe site (meniu, descrieri, greutăți, prețuri) să fie corecte.
        Imaginile sunt ilustrative. Nu răspundem pentru întârzieri cauzate de situații în afara controlului nostru
        (trafic, vreme, forță majoră); te vom anunța.
      </p>

      <H2>10. Reclamații și litigii</H2>
      <p>
        Ne poți scrie oricând la adresa de email de mai sus. Pentru soluționarea alternativă a litigiilor consultă
        pagina <Link href={ANPC_PATH}>ANPC</Link> (SAL și SOL). Legea aplicabilă este legea română.
      </p>
    </LegalPage>
  );
}
