"use client";

import { useEffect, useRef, useState } from "react";
import { MENU_SECTIONS } from "@/lib/catalog";
import { sectionDomId } from "./ids";
import { ALL_TAB, CATEGORY_BAR_ID, HEADER_HEIGHT, prefersReducedMotion, scrollToTab, stickyOffset } from "./layout";
import { Display } from "@/components/Display";

const TABS = [
  { id: ALL_TAB, name: "TOT MENIUL" },
  ...MENU_SECTIONS.map(({ category }) => ({ id: category.id, name: category.name })),
];

export default function CategoryBar() {
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const barRef = useRef<HTMLElement>(null);

  // Scroll spy: the active tab is the last section whose top has passed under the sticky bar.
  useEffect(() => {
    const onScroll = () => {
      const offset = stickyOffset(16);
      let current = ALL_TAB;
      for (const { category } of MENU_SECTIONS) {
        const el = document.getElementById(sectionDomId(category.id));
        if (el && el.getBoundingClientRect().top <= offset) current = category.id;
      }
      setActiveTab(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the active tab visible inside the horizontally scrolling bar (mobile).
  useEffect(() => {
    const bar = barRef.current;
    const tab = bar?.querySelector<HTMLElement>(`[data-tab="${activeTab}"]`);
    if (!bar || !tab) return;
    bar.scrollTo({
      left: tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [activeTab]);

  return (
    <nav
      ref={barRef}
      id={CATEGORY_BAR_ID}
      aria-label="Categorii meniu"
      style={{ top: HEADER_HEIGHT }}
      className="sticky z-30 bg-[#F5E6CC] border-b-2 border-[#332420] px-4 py-3 shadow-sm overflow-x-auto overscroll-x-contain snap-x snap-proximity"
    >
      <div className="w-max mx-auto flex gap-3">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-tab={tab.id}
              aria-current={active ? "true" : undefined}
              onClick={() => {
                scrollToTab(tab.id);
                setActiveTab(tab.id);
              }}
              className={`font-bebas text-xl tracking-wide px-5 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 snap-center border-2 border-[#332420] ${
                active
                  ? "bg-[#790D20] text-[#F5E6CC] shadow-[3px_3px_0px_0px_#332420]"
                  : "bg-[#F5E6CC] text-[#332420] hover:bg-[#332420]/10"
              }`}
            >
              <Display>{tab.name}</Display>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
