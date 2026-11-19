import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { H2 } from "@/components/legal/LegalPage";
import { ANPC_PATH, EMAIL, PHONE } from "@/lib/legal";
import { DELIVERY_RADIUS_KM, SITE_ADDRESS } from "@/lib/site";
import { DELIVERY_FEE_STANDARD, FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Livrare, ridicare, anulare și retur",
  alternates: { canonical: "/livrare-retur" },
};

export default function LivrareReturPage() {
  return (
    <LegalPage title="Livrare, ridicare, anulare și retur">
      <H2>1. Livrare</H2>
      <ul>
        <li>Livrăm într-o rază de {DELIVERY_RADIUS_KM} km în jurul restaurantului ({SITE_ADDRESS.line}). Harta zonei este pe pagina principală.</li>
        <li>Taxa de livrare este {DELIVERY_FEE_STANDARD} lei; livrarea este gratuită pentru comenzi de peste {FREE_DELIVERY_THRESHOLD} lei.</li>
        <li>Timpul de livrare este estimativ și depinde de încărcarea bucătăriei și de trafic. Te anunțăm dacă apar întârzieri.</li>
        <li>Ai grijă să dai o adresă corectă și un număr de telefon la care răspunzi. Dacă nu putem ajunge la tine, comanda poate fi anulată.</li>
      </ul>

      <H2>2. Ridicare din restaurant</H2>
      <p>
        Poți alege ridicarea personală de la {SITE_ADDRESS.line}, {SITE_ADDRESS.sector}, fără taxă de livrare. Plata
        se face tot online, cu cardul, la plasarea comenzii. Comanda este gata în timpul estimat afișat după plasare.
      </p>

      <H2>3. Plata</H2>
      <p>Plata se face doar online, cu cardul, prin NETOPIA Payments. Prețurile sunt în lei și includ TVA.</p>

      <H2>4. Anulare</H2>
      <ul>
        <li>Poți anula comanda sunând la {PHONE} cât timp nu a început prepararea ei.</li>
        <li>După începerea preparării, comanda nu mai poate fi anulată, deoarece mâncarea este făcută special pentru tine.</li>
        <li>Dacă anulăm noi comanda (produs epuizat, adresă în afara zonei), banii se returnează integral, în contul cardului folosit la plată.</li>
      </ul>

      <H2>5. Retur și dreptul de retragere</H2>
      <p>
        Produsele noastre sunt alimente preparate la comandă, perisabile. Conform art. 16 din OUG nr. 34/2014 privind
        drepturile consumatorilor în cadrul contractelor încheiate la distanță, dreptul de retragere în 14 zile{" "}
        <strong>nu se aplică</strong> produselor susceptibile să se deterioreze sau să expire rapid și celor
        confecționate după specificațiile consumatorului. Prin urmare, nu putem primi înapoi mâncarea după livrare.
      </p>

      <H2>6. Comandă greșită, incompletă sau cu probleme</H2>
      <p>
        Dacă ai primit altceva decât ai comandat, lipsește un produs sau mâncarea are o problemă, contactează-ne cât
        mai repede la {PHONE} sau {EMAIL}, cu numărul comenzii (BRG-XXXX). Remediem situația prin înlocuirea
        produsului sau returnarea contravalorii, după caz. Drepturile tale legale privind conformitatea produselor
        rămân neatinse.
      </p>

      <H2>7. Reclamații</H2>
      <p>
        Dacă nu ești mulțumit, scrie-ne. Poți apela și la soluționarea alternativă a litigiilor, vezi pagina{" "}
        <Link href={ANPC_PATH}>ANPC</Link>.
      </p>
    </LegalPage>
  );
}
