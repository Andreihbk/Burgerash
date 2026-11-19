import type { Metadata } from "next";
import LegalPage, { H2 } from "@/components/legal/LegalPage";
import CompanyDetails from "@/components/legal/CompanyDetails";
import { ANSPDCP } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Confidențialitate și cookies",
  alternates: { canonical: "/confidentialitate" },
};

export default function ConfidentialitatePage() {
  return (
    <LegalPage title="Politica de confidențialitate și cookies">
      <p>
        Această politică explică ce date personale prelucrăm când comanzi de pe burgerash.ro, de ce, cu cine le
        partajăm și ce drepturi ai, conform Regulamentului (UE) 2016/679 (GDPR).
      </p>

      <H2>1. Operatorul datelor</H2>
      <CompanyDetails />

      <H2>2. Ce date prelucrăm și de ce</H2>
      <ul>
        <li>
          <strong>Date de comandă</strong>: nume, telefon, email (opțional), adresa de livrare și detalii, observații,
          conținutul comenzii. Scop: preluarea, prepararea, livrarea și facturarea comenzii. Temei: executarea
          contractului (art. 6 alin. 1 lit. b GDPR).
        </li>
        <li>
          <strong>Date de plată</strong>: plata se face la NETOPIA Payments; noi nu vedem și nu stocăm datele cardului,
          primim doar confirmarea plății.
        </li>
        <li>
          <strong>Date tehnice anti-abuz</strong>: adresa IP, stocată doar sub formă de cod criptografic (hash), pentru
          limitarea comenzilor automate. Temei: interes legitim (art. 6 alin. 1 lit. f).
        </li>
        <li>
          <strong>Obligații legale</strong>: documente contabile și fiscale (art. 6 alin. 1 lit. c).
        </li>
      </ul>
      <p>Nu folosim datele tale pentru marketing și nu luăm decizii automate cu efecte asupra ta.</p>

      <H2>3. Cât păstrăm datele</H2>
      <p>
        Păstrăm datele comenzii doar cât este necesar pentru scopurile de mai sus și pentru perioadele impuse de lege
        (de exemplu, pentru documentele contabile). După aceea sunt șterse sau anonimizate.
      </p>

      <H2>4. Cu cine partajăm datele (persoane împuternicite)</H2>
      <ul>
        <li><strong>Supabase</strong>: baza de date a comenzilor.</li>
        <li><strong>Vercel</strong>: găzduirea site-ului.</li>
        <li><strong>NETOPIA Payments</strong>: procesarea plăților cu cardul.</li>
        <li><strong>Ebriza</strong>: sistemul de casă (POS) în care se înregistrează comenzile.</li>
        <li>
          <strong>Furnizori de hărți (OpenStreetMap / OpenFreeMap)</strong>: harta de pe site încarcă dale de hartă de
          la acești furnizori; browserul tău le contactează direct, deci adresa ta IP le este vizibilă.
        </li>
      </ul>
      <p>Nu vindem datele tale. Le divulgăm autorităților doar când legea o cere.</p>

      <H2>5. Drepturile tale</H2>
      <p>
        Ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție, precum și dreptul de a
        retrage consimțământul (acolo unde se aplică). Scrie-ne la adresa de email de mai sus; răspundem în cel mult 30
        de zile.
      </p>
      <p>
        Ai dreptul de a depune o plângere la {ANSPDCP.name}, {ANSPDCP.address}, email{" "}
        <a href={`mailto:${ANSPDCP.email}`}>{ANSPDCP.email}</a>,{" "}
        <a href={ANSPDCP.site} target="_blank" rel="noopener noreferrer">dataprotection.ro</a>.
      </p>

      <H2>6. Cookies și stocare locală</H2>
      <p>
        Folosim doar stocare strict necesară funcționării site-ului, fără cookies de analiză sau de marketing:
      </p>
      <ul>
        <li>coșul tău de cumpărături și ultima comandă, salvate local în browser (localStorage), ca să nu le pierzi la reîncărcare;</li>
        <li>cookies de sesiune pentru accesul personalului (doar în zonele interne, nu pentru clienți).</li>
      </ul>
      <p>
        Fiind strict necesare, nu cer consimțământ. Poți șterge oricând datele din setările browserului; coșul va fi
        golit. Dacă vom adăuga în viitor cookies de analiză sau marketing, vei fi întrebat înainte.
      </p>

      <H2>7. Modificări</H2>
      <p>Dacă această politică se schimbă, actualizăm data de la începutul paginii.</p>
    </LegalPage>
  );
}
