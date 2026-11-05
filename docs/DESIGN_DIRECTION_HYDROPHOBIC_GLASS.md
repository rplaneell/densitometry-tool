# Design direction: hydrophobic liquid glass

Source: two reference images (water shaped glass molecules with droplets on a blue gradient; a glass sphere holding a smaller sphere, dark, with sparkle and a reflective floor). Colours were measured from the images, not guessed.

## What the images say

| Measured | Value |
|---|---|
| Hue of every dominant colour | 207 to 222 degrees (cool blue), low saturation |
| Darks | #12192A, #17171B, #21272F |
| Steel blues | #374C6C, #496386, #6180A4 |
| Light | #7B9DBF, #9ABCD8 |
| Where the drama comes from | light, not colour: bright rim and specular edges, refracted glow, tiny water droplets, nested spheres, depth of field |

## Translation into the dashboard

1. **Scene and slabs.** A deep blue water scene (dark navy to steel blue gradient with soft light pools) with fine grain. All content sits on **frosted glass slabs**: translucent light panels with a bright rim, a soft sheen and a few water beads at the corners. Data stays on a light surface, so charts and tables stay as readable as before.
2. **Glass sphere.** The hero shows the simulated gel inside a glass sphere with a thin bright rim light and a specular highlight: the sphere inside a sphere from the second image.
3. **Droplets.** Fine water droplets with a specular dot drift on the scene behind the glass (static in calm mode and with reduced motion; the glass blurs them like real water behind glass).
4. **One loud colour.** Ice cyan (#63DDF5) is used once per screen: the main button, the status dot, the progress line, the current step. Everything else is steel blue on glass.
5. **Dark glass chrome.** Header, step rail and footer are dark glass with a light rim, so the content slabs stand out.
6. **Same family everywhere.** The molecular entrance (liquid glass water molecules, metallic cage) and the dashboard share the material language. The entrance uses electric cyan on near black as briefed; a later step can shift its tint toward the steel blue of the images.

## 4K and high density screens

- Content scales up on very large screens (1.2 times from 2200 px, 1.45 from 2800 px, 1.75 from 3400 px) with a switch to turn it off.
- Canvases (droplets, entrance) render at the screen's native density but are capped near 8 megapixels (a full 4K frame), so they stay sharp and cheap.
- Fine grain over the gradients prevents banding, which is most visible on large, smooth screens.
- Everything else is vector (text, borders, rim lights, the logo), so it stays razor sharp at any size. Checked at native 3840 by 2160 and at 1920 by 1080 on a double density screen.

## Customization

The Customize panel has a Glass section (glass intensity: transparency and blur; droplets on or off) next to the existing options (themes including a plain light one and a colour blind safe one, accent colour, text size, spacing, headings, corners, contrast, layout, motion, plots).

## Accessibility and checks

Verified in a browser: text contrast measured on the real pixels behind the text (not guessed), 17 checks pass, including every one of the 60 buttons on the page; reduced motion shows no animation; print drops the glass and prints plain white; plotted values equal the dashboard's numbers exactly after every setting change.

Bugs found and fixed while building this: slab text too faint for small labels (3.7 to 1, now 5.3 to 1 or better); about 20 secondary buttons unreadable on dark glass; the main hero button lost its colour after a fix of mine; content pushed off centre on 4K; the hero's bottom button clipped by the slanted edge.

## Honest limits

- Built on a stand in dashboard (the gel densitometry page); the real Hydra dashboard has not been uploaded. Expect to re tune slab padding and a few components once it is.
- Glass uses `backdrop-filter` (blur). It is supported by current Chrome, Safari, Edge and Firefox, but it costs GPU time on very old devices. The Customize panel's glass intensity lowers it.
- Not yet checked on a real 4K display or on real phones; checked at those pixel sizes in a software rendered browser.
- Water droplets are decoration and are not physically accurate. The molecule art is schematic.
