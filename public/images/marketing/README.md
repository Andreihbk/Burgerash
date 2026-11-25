# Marketing photos

Mood photos (red tiles, smash burgers, fries, chips, branded paper). NOT the menu:
product cards keep the SVG stickers. See docs/PHOTOS.md for where each photo goes.

Rules before adding a file here:
- Name: kebab-case, what is in it, e.g. `hero-tiles-burger.jpg`.
- Size: longest side max 2400 px, JPG quality ~80, under ~600 KB.
- Strip EXIF/GPS metadata (the resize script does this).
- Always render with `next/image` (it serves WebP/AVIF and the right size automatically).
