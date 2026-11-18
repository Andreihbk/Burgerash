/** Single money formatter: whole lei, no decimals, "LEI" suffix (e.g. "84 LEI"). */
export const formatLei = (value: number): string => `${Math.round(value)} LEI`;
