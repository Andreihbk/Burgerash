# Burgerash - Design direction

## Reference sites (inspiration only, never copy)
- https://www.le-smash.com/
- https://maijard.com/
- https://www.skinnylouie.com/

## Feel
Clean, retro, confident. Not loud. The ordering site comes first: ordering is always 1-2 taps away.

## Signature elements (the only "personality" pieces)
- The hero headline: YOUR LOCAL BURGER SPOT. (the lightbox menu board is archived: docs/archive/)
- The round stickers (BurgerStamp).
- The curved double red stripe from the board - the only divider style.
- The receipt (bon) look for the cart.

## Calm everywhere else
- Lots of space, few animations.
- Motion is short and fast (150-250ms) and respects `prefers-reduced-motion`.
- No gradients, no generic icon-in-every-button, no fade-in on every section.

## Copy
Short, local, confident Romanian. Example: "Nu facem medium. Facem crustă."
No generic marketing lines.

## Typography
- Eatvetica for display/headings (designer's written permission), Nunito for body and all digits, Roboto Mono for small accents. Eatvetica has no diacritics: stripDiacritics on display text.
- Chosen because it has full Romanian coverage (Ă Â Î Ș Ț); Titan One and Lilita One lack Ș/Ț.
- Nunito Black is wider than Bebas Neue: keep heading sizes/tracking modest at 375px.

## Usability
- Tap targets >= 44px.
- Readable contrast on sand.
- Video: ONE short loop on the site, nowhere else (Andrei, 2026-11-27). Rules:
  - 6-10 s, muted, no sound track, seamless loop, no text burned in. Mood only (plită, window, slow-mo), never as menu data.
  - Small: 1-2 MB max. MP4 (H.264) + WebM, 720p wide / 720x1280 vertical, no audio track. Lives in public/videos/.
  - Poster image first (a frame of the clip as JPG). `preload="none"`, starts only when in view (lazy).
  - No autoplay with prefers-reduced-motion or Save-Data / data-saver: show the poster only.
  - `playsInline muted loop`, no controls, aria-hidden (decorative). Never above the COMANDĂ button on mobile.
  - Mobile speed must stay ~85 (PageSpeed). If it drops, the poster replaces the video.
  - Build it only when the real clip arrives (spec for the photographer: docs/PHOTOS.md "Video").
- Marketing photos: mood only, never as product images. Rules in docs/PHOTOS.md.
- Mobile-first (375px).

## Later ideas
Agreed with Andrei on 2026-11-26. Not built yet; pick from here. Rules above still apply (no fake data, no "smash", reduced motion, nothing that slows ordering).

### Visual (need an asset or real data first)
- "Burgerul vedetă": a floating cut-out burger in the hero. Needs a cut-out photo (transparent PNG) from the shoot.
- Review strip: only with real Google reviews (quoted with name + link). Never invent reviews.
- Call button next to "Du-mă acolo": as soon as the shop has a phone number (CONTACT.phone in src/lib/hours.ts).
- Menu cards dropping in on scroll: left out on purpose, the menu must stay instantly tappable. Revisit only if it never delays ordering.
- Receipt-style cart.
- "Cum se face un burger" in 5 steps (photos or stickers).

### Ordering and product (non-visual)
- Pick Up / Delivery as the first step of checkout (before the form).
- Live sold-out per product on the storefront (the admin stock toggles already exist; show it everywhere in real time).
- Apple Pay / Google Pay through Netopia, once the Netopia account is active.
- House rules (short, in our tone).
- Sticker loyalty card (collect the 6 burger stickers).
- UTM tags go on links that point TO our site (Instagram bio, Google profile, Glovo/Wolt profile text), not on our outgoing links:
  e.g. `https://www.burgerash.ro/?utm_source=instagram&utm_medium=bio`. Andrei pastes them where those profiles allow a link.
- Sticky "Comandă" button on phones: skipped for now because the bottom tab bar + cart bar already do this job; revisit at launch if people miss it.

### New ideas (2026-11-27)
- "Burgeri azi" counter from real orders (Supabase), only after launch. Never a made-up number.
- "Burgerul săptămânii" banner, switched on/off from /admin (owner picks the product).
- Sticker peel on menu cards (desktop hover): the sticker corner lifts a little.
- Combo (burger + fries + drink) at a combo price: needs the owner's prices first.
- Share image (Facebook/WhatsApp) from the new shoot (S7).

### Done (2026-11)
- Short FAQ, Despre noi, Instagram strip, branded 404.
- Scroll motion: pinned photo carousel, stickers roll in, ticker speeds up, headings rise in, about tags stamp in.
- Page progress bar, numbered section labels, "Du-mă acolo" directions button, photo hover zoom (desktop).
- Map in brand colours (static poster, no zoom/drag, "LIVRARE 1 KM" tag), parallax on the Despre noi photo (desktop),
  sticker flies to the cart on "Adaugă" (off with reduced motion).
