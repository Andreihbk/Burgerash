# Archive

Things removed from the site on purpose, kept so they can come back.

## Menu board (removed from the homepage, Nov 2026)
- Component: `src/components/archive/MenuBoard.tsx` (not imported anywhere; still type-checked by the build).
- Screenshot: `menu-board-2026-11.png` (how it looked on the homepage).
- Why: owner asked to take it off the homepage. The ordering menu (cards) stays.
- To bring it back: import it in `src/components/storefront/HeroBoard.tsx` and render
  `<MenuBoard lit={...} linkedNames={[...]} onLineActive={...} onSelect={...} />` below the ticker (see git history of that file).
