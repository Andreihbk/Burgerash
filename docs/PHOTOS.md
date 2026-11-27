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

## Video (one loop on the site)
Ask the photographer for (rules in docs/DESIGN.md, Usability):
- V1, main pick: patty hitting the plită or the burger going out the window, 6-10 s, steady (tripod), loops cleanly.
- V2, backup: slow-mo (cheese melt, sauce, bun press), 120 fps or more.
- Both horizontal 16:9 AND vertical 9:16 if possible (site desktop + phone/Instagram), 4K or 1080p originals.
- No music needed on site (muted); for social the same clips can get sound.
We cut and compress to 1-2 MB ourselves.

## Check before going live
- The photographer/boss agrees the photos can be used on the website (written OK is enough).
