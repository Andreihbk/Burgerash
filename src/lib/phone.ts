/** Romanian mobile numbers: 07xx xxx xxx, +40 7xx xxx xxx or 0040 7xx xxx xxx. */
export function normalizeRoPhone(input: string): string | null {
  const compact = input.replace(/[\s.\-()]/g, "");
  const match = /^(?:\+40|0040|0)(7\d{8})$/.exec(compact);
  return match ? `0${match[1]}` : null;
}

export const PHONE_ERROR = "Introdu un număr valid, ex. 0721 123 456 sau +40 721 123 456.";
