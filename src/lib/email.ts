/** Pragmatic email check, shared by the checkout form and /api/orders. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const EMAIL_ERROR = "Introdu o adresă de email validă, ex. nume@example.com.";

export const isValidEmail = (value: string): boolean => EMAIL_RE.test(value.trim());
