import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { H2 } from "@/components/legal/LegalPage";
import { ANPC_SAL_URL, ANPC_SOL_URL } from "@/lib/legal";

export const metadata: Metadata = { title: "ANPC", alternates: { canonical: "/anpc" } };

export default function AnpcPage() {
  return (
    <LegalPage title="ANPC: soluționarea alternativă a litigiilor">
      <p>
        Dacă ai o problemă cu o comandă, încearcă mai întâi să ne contactezi direct, la datele din{" "}
        <Link href="/termeni">Termeni și condiții</Link>. Dacă nu ajungem la o înțelegere, ai la dispoziție:
      </p>

      <H2>SAL: soluționarea alternativă a litigiilor</H2>
      <p>
        Entitățile SAL sunt organisme care soluționează extrajudiciar litigiile dintre consumatori și comercianți.
      </p>
      <p>
        <a href={ANPC_SAL_URL} target="_blank" rel="noopener noreferrer">{ANPC_SAL_URL}</a>
      </p>

      <H2>SOL: soluționarea online a litigiilor</H2>
      <p>
        Platforma europeană de soluționare online a litigiilor, pentru comenzile făcute online.
      </p>
      <p>
        <a href={ANPC_SOL_URL} target="_blank" rel="noopener noreferrer">{ANPC_SOL_URL}</a>
      </p>

      <H2>ANPC</H2>
      <p>
        Autoritatea Națională pentru Protecția Consumatorilor:{" "}
        <a href="https://anpc.ro" target="_blank" rel="noopener noreferrer">anpc.ro</a>.
      </p>
    </LegalPage>
  );
}
