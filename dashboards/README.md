# Gel densitometry dashboard: three design versions

All three are the same page with a design layer added on top. The page's own scripts are byte identical to the original (checked automatically), its visible text and chart markup are unchanged, and nothing scientific is recalculated.

| File | Character |
|---|---|
| `proteinquant_1_SAFE.html` | Calm by default, sapphire and ocean blue with one neon jade accent, compact hero, left step rail on wide screens |
| `proteinquant_2_CRAZY.html` | Bold type, hard offset shadows, moving ticker, motion on |
| `proteinquant_3_SUPER_CRAZY.html` | Ink black neon zine: scan lines, glowing shadows, wobbling buttons, neon cursor ring |
| `proteinquant_ORIGINAL_untouched.html` | The file exactly as received |

Shared in all three: one palette (sapphire, ocean blue, neon jade, plus amber reserved for samples and warnings; every legacy colour in the page's stylesheet and drawn charts is mapped to it), and the **Interactive explorer** panel under the results (step 4).

## Interactive explorer
Built with Apache ECharts 5.5.1, inlined unmodified (licence in `third_party/`). It is read only: it reads `window.__state` and the page's own results table and calculates nothing. Hover shows the page's own formatted numbers; wheel or drag zooms; sort, 95 % range, log axis, three palettes (blue and jade, colour blind safe, greyscale for print), reset zoom, save image. Hidden in print. Tested on the page's built in simulated gels: all plotted values, ranges, control points and the fitted curve equal the page's numbers exactly.

`layer_sources/` holds the injected sources and `build.py`, which assembles each version from the original file.
