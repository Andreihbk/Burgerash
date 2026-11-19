# Design ideas (backlog)

Not scheduled. Ideas only; pick one per task and move it into docs/PLAN.md when it is decided.
Brand tokens, sticker colors and fonts from CLAUDE.md still apply to everything below.

- [ ] **Menu cards in panel style, with real burger photos.** Product cards styled like the physical menu panel,
      using real photographs of the burgers. (Note: CLAUDE.md currently says product visuals are SVG stickers,
      not photos. Decide how photos and stickers coexist before building.)
- [ ] **Scroll animations, big photography, rhythm.** Larger photos, alternating section rhythm, subtle
      scroll-triggered motion. Inspiration only, no copying of other sites. Respect `prefers-reduced-motion`.
- [ ] **"Cum se face" section.** Shows how a burger is made (the plita / griddle, the crusta) with a short video.
      Keep the video light (muted, lazy-loaded, poster image).
- [ ] **Mobile sticky cart bar.** Rework the existing bottom bar (`MobileCartBar`) if needed; check it against
      the new sections and the toast.
- [ ] **Instagram posts/reels section.** Show recent posts or reels on the page. Decide embed vs. curated static
      images (embeds load third-party scripts: update the privacy/cookies page if used).
- [ ] **Fix duplicated map attribution.** The location map (`LocationMap.tsx`) shows the attribution twice;
      keep exactly one, still legally correct for OpenStreetMap / OpenFreeMap.
