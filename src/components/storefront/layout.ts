import { sectionDomId } from "./ids";

// Header has a fixed height so the category bar can stick right under it.
export const HEADER_HEIGHT = 72;
export const ALL_TAB = "all";
export const MENU_TOP_ID = "meniu";
export const CATEGORY_BAR_ID = "category-bar";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scroll offset that clears the sticky header + category bar. */
export const stickyOffset = (extra: number) =>
  HEADER_HEIGHT + (document.getElementById(CATEGORY_BAR_ID)?.offsetHeight ?? 0) + extra;

/** Smooth-scroll to a menu section (or the top of the menu for ALL_TAB). */
export function scrollToTab(tabId: string) {
  const target = document.getElementById(tabId === ALL_TAB ? MENU_TOP_ID : sectionDomId(tabId));
  if (!target) return;
  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY - stickyOffset(12),
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}
