import { CheckCircle2 } from "lucide-react";
import { Display } from "@/components/Display";

export default function SuccessStep({
  orderNumber,
  publicToken,
  onBackToMenu,
}: {
  orderNumber: string;
  publicToken: string;
  onBackToMenu: () => void;
}) {
  return (
    <div className="text-center py-12 space-y-4">
      <CheckCircle2 className="w-16 h-16 text-wine mx-auto" />
      <h3 className="font-display text-4xl text-charcoal"><Display>COMANDĂ PLASATĂ!</Display></h3>
      <p className="font-mono text-lg font-bold bg-charcoal text-sand py-2 px-4 inline-block rounded">
        Număr bon: {orderNumber}
      </p>
      <p className="font-nunito text-sm text-charcoal/80">
        Comanda ta a fost primită. Focul e pornit!
      </p>
      {publicToken && (
        <div>
          <a
            href={`/comanda/${publicToken}`}
            className="mt-2 inline-flex min-h-11 items-center bg-charcoal text-sand font-display text-xl px-6 py-3 rounded shadow-[3px_3px_0px_0px_var(--color-wine)]"
          >
            <Display>URMĂREȘTE COMANDA</Display>
          </a>
        </div>
      )}
      <button
        onClick={onBackToMenu}
        className="mt-4 bg-wine text-white font-display text-xl px-6 py-3 rounded shadow-[3px_3px_0px_0px_var(--color-charcoal)]"
      >
        <Display>ÎNAPOI LA MENIU</Display>
      </button>
    </div>
  );
}
