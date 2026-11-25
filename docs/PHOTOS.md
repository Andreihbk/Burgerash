# Marketing photos - placement guideline

13 photos from the shoot (Nov 2026): burgers, fries, chips, red tiles, branded paper.
They are **mood photos, not the menu**. Menu data, product cards and stickers do not change.

## The rules
1. Photos set the mood; stickers sell the product. Never use a photo as a product card image.
2. One photo idea per section. Carousel photos lazy-load, so only what is on screen is downloaded.
3. No text on top of a photo. Text sits on sand next to it (contrast + Eatvetica stays readable).
4. Photo frame = same style as the buttons: rounded-2xl, 2px charcoal border, hard charcoal offset shadow. No gradients, no filters.
5. Colors in the UI stay the 3 brand tokens + sticker colors. The photos' yellow/orange never becomes a UI color.
6. Always `next/image` with `sizes`. Only the hero photo gets `priority`; all others lazy-load.
7. Alt text in short Romanian ("Burger cu cheddar pe tavă").

## Where each photo goes (file names = WhatsApp export from the shoot)

| Spot | Source photo | File in public/images/marketing |
|---|---|---|
| Hero (right column desktop, under COMANDĂ on mobile) + 3 stickers on its corner | 56_4 burger + fries on tray, red tiles | `hero-tray-fries.jpg` |
| "PROASPĂT. PE LOC." carousel under the ticker (7 slides, swipe + arrows, no autoplay) | 56_3, 56_1, 57_4, 56_2, 57_2, 57_3, 57 | `strip-*.jpg`, `carousel-*.jpg` |
| Location section, next to "LIVRARE PROPRIE & PICKUP" | 55 hand holding the tray | `location-tray-hand.jpg` |
| "DIN CARTIER." (Despre noi) | 56 bacon burger | `about-bacon.jpg` |
| Instagram strip (4 square tiles, link to profile) | 55_1, 57_1, 57_5 + 57 | `ig-motion.jpg`, `ig-crispy.jpg`, `ig-topview.jpg`, `carousel-wrapped.jpg` |
| Later: share image (Facebook/WhatsApp) | 57_5 top view, burger + fries | - |

## Files
- Web versions are made from the originals with sharp: max 1600 px wide, JPG q82, metadata stripped. Sources: `docs/brand/PHOTO-2026-11-25-*.jpg`.
- The current files are WhatsApp copies (853x1280). When the photographer's originals arrive, re-export with the same names: no code change.

## Check before going live
- The photographer/boss agrees the photos can be used on the website (written OK is enough).
