// Cheap bot checks for the checkout form (PLAN B.1). Shared by CartDrawer and /api/orders.
// - Honeypot: an off-screen field humans never see. Filled -> treated as a bot: fake success, no order.
// - Timing: the form reports how long the checkout step was open. Under MIN_FORM_MS -> a normal 400,
//   because a fast human (browser autofill) must be able to just submit again.
// A bot posting straight to the API can fake both; the per-IP rate limit is the real defence.

/** Deliberately meaningless name so browser autofill never fills it. */
export const HONEYPOT_FIELD = "brg_confirm_x";
export const MIN_FORM_MS = 3000;
export const TOO_FAST_ERROR = "Verifică datele și trimite din nou.";

export type BotCheck = { ok: true } | { ok: false; reason: "honeypot" | "too_fast" };

export function checkBot(body: Record<string, unknown>): BotCheck {
  const trap = body[HONEYPOT_FIELD];
  if (trap !== undefined && trap !== null && String(trap).trim() !== "") {
    return { ok: false, reason: "honeypot" };
  }

  const elapsed = Number(body.form_elapsed_ms);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FORM_MS) {
    return { ok: false, reason: "too_fast" };
  }

  return { ok: true };
}

/** Looks like a real /api/orders success, but nothing was stored. */
export function fakeOrderSuccess() {
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return {
    success: true,
    order_id: crypto.randomUUID(),
    order_number: `BRG-${digits}`,
    public_token: crypto.randomUUID().replace(/-/g, ""),
  };
}
