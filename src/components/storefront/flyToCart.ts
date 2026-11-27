import { prefersReducedMotion } from "./layout";

/**
 * Small "added" feedback: a copy of the product sticker flies from the card to the cart button.
 * Purely decorative (the cart is already updated, the toast still shows). Skipped with reduced motion.
 * The cart buttons carry `data-cart-target`; the first one that is visible on screen is used.
 */
export function flyToCart(from: Element) {
  if (typeof window === "undefined" || prefersReducedMotion()) return;
  const sticker = from.closest("li")?.querySelector("svg");
  const target = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]")).find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
  });
  if (!sticker || !target) return;

  const a = sticker.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  if (a.width === 0) return;

  const ghost = sticker.cloneNode(true) as SVGElement;
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${a.left}px`,
    top: `${a.top}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    margin: "0",
    zIndex: "60",
    pointerEvents: "none",
  });
  document.body.appendChild(ghost);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const end = Math.max(0.12, Math.min(0.4, 28 / a.width));
  const anim = ghost.animate(
    [
      { transform: "translate(0, 0) scale(1) rotate(-6deg)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(${(1 + end) / 2}) rotate(90deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(${end}) rotate(200deg)`, opacity: 0.3 },
    ],
    { duration: 650, easing: "cubic-bezier(0.5, 0, 0.75, 0)" },
  );
  const done = () => ghost.remove();
  anim.onfinish = done;
  anim.oncancel = done;
}
