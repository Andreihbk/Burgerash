"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "./layout";

/**
 * Light scroll motion for the storefront. Renders nothing.
 * - All screens: elements marked `data-reveal` rise in once (`data-reveal="stamp"` pops in like a stamp).
 * - Desktop only: hero stickers turn a little with the scroll, the ticker speeds up while scrolling.
 * Off entirely with prefers-reduced-motion. Never touches the menu, cart or order buttons.
 * Content is only hidden once this runs (html[data-motion]), so nothing stays hidden without JS.
 */
export default function ScrollEffects() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = document.documentElement;
    root.dataset.motion = "";

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.shown = "";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => io.observe(el));

    if (!window.matchMedia("(min-width: 768px)").matches) {
      return () => {
        io.disconnect();
        delete root.dataset.motion;
      };
    }

    const tickers = Array.from(document.querySelectorAll<HTMLElement>(".ticker-track")).flatMap((el) => el.getAnimations());
    let lastY = window.scrollY;
    let lastT = performance.now();
    let rate = 1;
    let target = 1;
    let raf = 0;
    let lastScroll = 0;

    // One frame loop that only runs while something is moving; eases the ticker back to normal speed.
    const frame = () => {
      const now = performance.now();
      if (now - lastScroll > 120) target = 1;
      rate += (target - rate) * 0.15;
      for (const a of tickers) a.playbackRate = rate;
      if (Math.abs(rate - 1) > 0.01 || target !== 1) raf = requestAnimationFrame(frame);
      else {
        for (const a of tickers) a.playbackRate = 1;
        raf = 0;
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      const now = performance.now();
      const speed = Math.abs(y - lastY) / Math.max(16, now - lastT); // px per ms
      lastY = y;
      lastT = now;
      lastScroll = now;
      target = 1 + Math.min(2, speed * 2);
      root.style.setProperty("--sticker-spin", `${Math.min(y, 800) * 0.03}deg`);
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      for (const a of tickers) a.playbackRate = 1;
      root.style.removeProperty("--sticker-spin");
      delete root.dataset.motion;
    };
  }, []);

  return null;
}
