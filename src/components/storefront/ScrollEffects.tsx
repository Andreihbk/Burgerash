"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "./layout";

/**
 * Light scroll motion for the storefront. Renders nothing.
 * - All screens: elements marked `data-reveal` rise in once (`data-reveal="stamp"` pops in like a stamp).
 * - Desktop only: hero stickers turn a little with the scroll, the ticker speeds up while scrolling,
 *   `[data-parallax]` photos drift a little inside their frames.
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

    // Thin page progress bar under the header (all screens).
    let progressRaf = 0;
    const onProgress = () => {
      cancelAnimationFrame(progressRaf);
      progressRaf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        root.style.setProperty("--page-progress", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
      });
    };
    window.addEventListener("scroll", onProgress, { passive: true });
    onProgress();
    const stopProgress = () => {
      window.removeEventListener("scroll", onProgress);
      cancelAnimationFrame(progressRaf);
      root.style.removeProperty("--page-progress");
    };

    if (!window.matchMedia("(min-width: 768px)").matches) {
      return () => {
        io.disconnect();
        stopProgress();
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

    // Parallax: the frame's centre vs the screen centre, max ±6% of the frame height (the photo is 16% taller).
    const parallaxEls = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const parallax = () => {
      const vh = window.innerHeight;
      for (const el of parallaxEls) {
        const frame = el.parentElement?.getBoundingClientRect();
        if (!frame || frame.bottom < 0 || frame.top > vh) continue;
        const t = (frame.top + frame.height / 2 - vh / 2) / (vh / 2 + frame.height / 2); // -1..1
        el.style.setProperty("--parallax", `${(t * frame.height * 0.06).toFixed(1)}px`);
      }
    };
    parallax();

    const onScroll = () => {
      const y = window.scrollY;
      const now = performance.now();
      const speed = Math.abs(y - lastY) / Math.max(16, now - lastT); // px per ms
      lastY = y;
      lastT = now;
      lastScroll = now;
      target = 1 + Math.min(2, speed * 2);
      root.style.setProperty("--sticker-spin", `${Math.min(y, 800) * 0.03}deg`);
      parallax();
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      stopProgress();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      for (const a of tickers) a.playbackRate = 1;
      root.style.removeProperty("--sticker-spin");
      for (const el of parallaxEls) el.style.removeProperty("--parallax");
      delete root.dataset.motion;
    };
  }, []);

  return null;
}
