# Marketing photos - placement guideline (DRAFT, waiting for OK)

13 photos from the shoot (Nov 2026): smash burgers, fries, chips, red tiles, branded paper.
They are **mood photos, not the menu**. Menu data, product cards and stickers do not change.

## The rules
1. Photos set the mood; stickers sell the product. Never use a photo as a product card image.
2. One photo idea per section. Max ~6 photos on the homepage (fast on 4G).
3. No text on top of a photo. Text sits on sand next to it (contrast + Eatvetica stays readable).
4. Photo frame = same style as the buttons: rounded-2xl, 2px charcoal border, hard charcoal offset shadow. No gradients, no filters.
5. Colors in the UI stay the 3 brand tokens + sticker colors. The photos' yellow/orange never becomes a UI color.
6. Always `next/image` with `sizes`. Only the hero photo gets `priority`; all others lazy-load.
7. Alt text in short Romanian ("Smash burger cu cheddar pe tavă").

## Where each photo goes (numbers = order in the Gmail email, left to right, top to bottom)

| Spot | Photo | Why |
|---|---|---|
| Hero, right column (desktop) | #9 burger cut in half on red tiles (or #3) | Red tiles = the shop's wall, warm, matches wine. Sticker fan overlaps its bottom-left corner. Mobile keeps the stickers only. |
| Under the ticker, where the menu board was: "FĂCUT PE PLITĂ" strip | #7 two smash burgers, #4 fries drop, #8 chips | 3 photos: burger, fries, chips. 3 columns on desktop, swipe (scroll-snap) on mobile. |
| Location section ("Vino să-l iei cald") | #5 hand holding the tray | Human, local, pick-up feeling. |
| Order confirmation page (later) | #1 burger wrapped in branded paper | "Your order is packed" feeling. |
| Social share image / Instagram (later, separate task) | #13 top view, fries + burger on branded paper | Square crop works. |
| Spare / not used now | #2, #11, #12 (near-duplicates, mostly tiles), #6 motion blur, #10 | Keep in the folder only if used; otherwise leave them out of the repo. |

## Files
- Folder: `public/images/marketing/` (see the README there).
- Names: `hero-burger-tiles.jpg`, `strip-two-burgers.jpg`, `strip-fries-drop.jpg`, `strip-chips.jpg`, `location-tray-hand.jpg`, `packed-burger.jpg`, `share-topview.jpg`.
- Before commit: longest side max 2400 px, JPG ~80, under ~600 KB, EXIF/GPS stripped.

## Check before going live
- The photographer/boss agrees the photos can be used on the website (written OK is enough).
