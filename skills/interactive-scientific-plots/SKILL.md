---
name: interactive-scientific-plots
description: Add interactive, customizable plots (hover details, zoom, sorting, palettes, a settings panel) to an existing scientific dashboard or single file HTML report without changing any computed number. Use when someone wants more interactive or more customizable charts on a tool that already computes the results, and scientific rigor and reproducibility across runs matter more than novelty.
---

# Interactive scientific plots

Written from a real job: adding an interactive layer and a Customize panel to a gel densitometry dashboard (single HTML file, strict content security policy, results computed by the page itself). The reference code in `references/` is that layer.

## Non negotiables

1. **Read only.** The layer reads numbers the page already computed. It never recalculates, rounds differently, refits or filters. If a number is not exposed, read the formatted text the page already shows (for example its results table) instead of re deriving it.
2. **Additive.** The page's own scripts stay byte identical and its own charts stay in place. Add a new panel next to them. Never replace a chart that carries results.
3. **No invented data.** Test with the tool's own example data or a file the user gives you. Never put made up numbers in a scientific tool. A demo with made up data goes in a separate, clearly labelled page.
4. **Prove fidelity.** Every build runs a test that compares what is plotted with the page's own state: exact equality, not "close".
5. **Honour what the page tells users.** If it says "nothing is saved in the browser", settings are not stored unless the user ticks an explicit opt in. Offer export and import of settings as a file.
6. **Calm.** No transitions on charts by default. Respect reduced motion. Hover and zoom on demand are the interactivity.

## Workflow

1. **Find the data door.** Look for exposed state (`window.__state`), data attributes on the SVG, or the rendered tables. Load the tool's example data in a browser and print the shape.
2. **Pick the library** (see table). Libraries must be inlined when a content security policy blocks the network: pin the exact version, keep the licence header, record the licence file.
3. **Mount outside the page's re rendering.** Insert your panel as a sibling of the container the page rewrites with `innerHTML`, and refresh it with a debounced `MutationObserver` on that container.
4. **Build the charts** from state for geometry and from the page's formatted strings for tooltips, so tooltips show exactly what the page shows. Match the page's own meaning of colour (for example sample colour, hatched for provisional).
5. **Customization.** One settings object drives everything. Typical groups: colour theme, accent colour, text size, spacing, heading font, corner shape, contrast, navigation position, intro size, motion, and plot options (type, labels, grid, mark size, label size, sort, range, log axis, palette). Include reset, export and import.
6. **One palette.** Audit every colour in the page's stylesheet and in the SVG it draws. Map each legacy colour to a token (`--primary`, `--accent` and so on) so a theme switch recolours everything, including the page's own charts. Keep a loud accent for one job per screen and never use it as small text on white.
7. **Verify** (all of these, every build):
   - original scripts present, unchanged and in order;
   - visible text and chart markup identical to the original (ignore live labels such as an animation switch and looping demo counters, and say so);
   - plotted values equal the page's state exactly, after every setting change;
   - phone width has no sideways scroll, no console errors, text contrast at least 4.5, reduced motion leaves no endless animation, print hides the layer.

## Choosing a library

| Need | Choice |
|---|---|
| Rich, themeable, hover, zoom, brush, one file, about 1 MB | Apache ECharts |
| Interactive HTML straight from Python | Plotly (`write_html`), see `skills_external/k_dense_scientific_skills/scientific-visualization` |
| Small, statistical, few lines | Observable Plot |
| Very large line or scatter data | uPlot or regl scatterplot |
| Linked views, click in one chart filters the others | Mosaic |
| Declarative spec that can be checked | Vega Lite |
| Static figures for papers | Matplotlib or Seaborn (skills included) |

## Mistakes already made (do not repeat)

- An early `return` inside a `try` skipped the line that reset a "busy" flag, so the panel ignored every later update. Use `finally`.
- Two tables shared one class (a ranking table and a detail table). Select by shape (column count), not by class alone.
- A panel using generic class names (`row`, `note`) inherited the page's own styles. Prefix everything.
- `backdrop-filter` on a header makes it the containing block for fixed children, which breaks a fixed side rail. Remove it.
- CSS `zoom` on the root makes automated clicks land in the wrong place. Reset zoom in tests before clicking.
- A hue rotate filter that fixed one palette overshot after the colours were remapped. Remove compensations once the cause is fixed.
- A mid scroll screenshot looked like a layout bug. Wait for scrolling to settle before judging.

## Files

- `references/explorer_layer.js` and `.css`: the read only explorer (results and standard curve).
- `references/customize_panel.js` and `.css`: the settings panel (themes, accent, sizes, plot options, export and import).
- `references/fidelity_test.js`: browser test that loads example data and checks plotted values equal the page's state.
- `references/build_layer.py`: how the layer is injected and how script integrity is checked.

These files are examples tied to one page (they read `window.__state`, `#resWrap` and similar). Adapt the data door; keep the rules.
