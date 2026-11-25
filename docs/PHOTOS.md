# Marketing photos - placement guideline

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

## Where each photo goes (file names = WhatsApp export from the shoot)

| Spot | Source photo | File in public/images/marketing |
|---|---|---|
| Hero (right column desktop, under COMANDĂ on mobile) + 3 stickers on its corner | 56_4 burger + fries on tray, red tiles | `hero-tray-fries.jpg` |
| "FĂCUT PE LOC." strip under the ticker (where the menu board was) | 56_3 cut double smash / 57_4 crispy chicken / 57_2 fries + chips | `strip-smash-cut.jpg`, `strip-crispy-chicken.jpg`, `strip-fries-chips.jpg` |
| Location section, next to "LIVRARE PROPRIE & PICKUP" | 55 hand holding the tray | `location-tray-hand.jpg` |
| Later: order confirmation page | 57 wrapped burger | - |
| Later: share image (Facebook/WhatsApp) | 56_2 top view, 3 burgers on branded paper | - |
| Spare | 55_1 motion blur, 56 bacon burger, 56_1 hand + fries, 57_1, 57_3, 57_5 | - |

## Files
- Web versions are made from the originals with sharp: max 1600 px wide, JPG q82, metadata stripped. Originals are not in the repo.
- The current files are WhatsApp copies (853x1280). When the photographer's originals arrive, re-export with the same names: no code change.

## Check before going live
- The photographer/boss agrees the photos can be used on the website (written OK is enough).
