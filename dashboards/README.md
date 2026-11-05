# Gel densitometry dashboard: customizable version

`proteinquant_customizable.html` is the original page with a design layer added on top. The page's own scripts are byte identical to the original (checked on every build), its visible text and chart markup are unchanged, and nothing scientific is recalculated. `proteinquant_ORIGINAL_untouched.html` is the file exactly as received.

## What was added
- **One palette** (sapphire, ocean blue, neon jade, with amber reserved for samples and warnings). Every legacy colour in the page's stylesheet and drawn charts is mapped to colour tokens, so a theme change recolours everything.
- **Calm by default** (the page's own calm mode), compact intro, left step menu on wide screens, wider content, J and K keys to move between sections, `?` for help, `C` for Customize.
- **Interactive explorer** under the results (step 4), built with Apache ECharts 5.5.1 inlined unmodified (licence in `third_party/`). Read only: it reads `window.__state` and the page's own results table. Hover shows the page's own formatted numbers, wheel or drag zooms, standard curve view included.
- **Customize panel** (button in the top bar): colour theme (sapphire and jade, ocean and coral, slate and teal, graphite for print, colour blind safe), accent colour, text size, spacing, heading font, corner shape, contrast, step menu position, intro size, motion, and plot options (bars or dots, value labels, grid, mark size, label size, 95 % range, sort, log axis, palette). Export, import and reset settings. Nothing is stored in the browser unless "Remember on this device" is ticked.

Tested on the page's built in simulated gels: every plotted value, range, control point and the fitted curve equals the page's numbers exactly, after every setting change.

`layer_sources/` holds the injected sources and `build.py`, which assembles the page from the original file.

## Visual direction (current default theme: Hydrophobic glass)
Inspired by two reference images of water shaped glass molecules and a glass sphere in a sphere. Deep steel blue scene, content on frosted glass slabs, the gel inside a glass sphere, fine water droplets, one ice cyan accent, sharp and scaled for 4K. Full notes in `../docs/DESIGN_DIRECTION_HYDROPHOBIC_GLASS.md`. The earlier sapphire and jade, ocean, slate, graphite and colour blind safe themes remain in the Customize panel.
