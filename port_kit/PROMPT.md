# Master prompt: bring every feature to the Hydra dashboard

Copy everything below the line into Claude Code, started inside this repository. Read `README.md` in this folder first if you want the short version.

---

You are working on the Hydra scientific results dashboard in this repository. Your job is to change how it LOOKS and how EASY IT IS TO USE, and to add interactive and customizable plots, while changing NOTHING scientific.

## 0. Hard rules (never break these)

1. **Do not change anything scientific.** No calculation, fit, filter, threshold, rounding, unit, data loading, example data, column name, result text or wording of a scientific claim. If you are unsure whether something is scientific, treat it as scientific and ask.
2. **Appearance, layout, colours, fonts, spacing, motion, navigation, tooltips and interactions only.**
3. **Additive.** Prefer adding a layer (new CSS, new components, new panels) to editing existing code. Existing charts that carry results stay in place; new interactive charts go next to them, read only.
4. **Never invent data.** Test only with the dashboard's own example data or files I give you. If no example data exists, stop and ask me for a sample.
5. **Prove, do not claim.** Everything you say works must be backed by a tool run from `port_kit/tools/`. Report failures plainly. If something was not tested, say so.
6. **Secrets.** Keys, tokens and passwords live only in a local `.env` file. Check that `.env` is in `.gitignore` and that a `.env.example` with empty values exists before the first commit. Never put a key in code, docs, chat or commit messages.
7. **Calm.** The dashboard is used for hours. No decorative motion by default, no flashing, respect reduced motion. Motion only answers an action (open, expand, confirm).
8. **Do not push to `main` or change repository settings without asking.** Work on a branch named `design-layer` and tell me when it is ready.
9. **Explain abbreviations the first time you use them** and write in plain language.

## 1. Read first (reference material in this repo)

- `skills/interactive-scientific-plots/SKILL.md` (the rules and the mistakes already made)
- `skills/frontend-design/SKILL.md`, `skills_external/dashboard-design/`, `skills/webapp-testing/SKILL.md`
- `skills_external/k_dense_scientific_skills/scientific-visualization/` if the dashboard uses Python plotting
- `port_kit/layer/` (the reference layer: usability, theme and structure, explorer, customize panel)
- `port_kit/tools/` (the checkers described in section 6)

Conflict note: the dashboard design skill prefers a wordless screen. Do NOT remove or shorten explanatory text. Keep every word.

## 2. Discover (do this before editing anything, then show me the findings and wait for my go ahead)

Answer each item with evidence from the code:

a. **Stack.** Single HTML file? React or Vue (Vite, Next)? Python (Dash, Streamlit, Panel, Flask)? R Shiny? Something else? How do I run it locally?
b. **Where the numbers come from.** Name the files that compute, fit, filter or load data. These are the PROTECTED files. List them as glob patterns.
c. **The data door.** How can a new chart read the already computed results without recomputing? (an exposed state object, a store, a dataframe passed to the plot function, a REST endpoint, rendered tables, data attributes.) If there is none, propose the smallest read only door and ask me before adding it.
d. **Example data.** Which built in example or sample file can I load to test?
e. **Existing charts.** List every chart, its library, its colours and which results it shows.
f. **Colours.** Run `python port_kit/tools/colour_audit.py . --palette port_kit/tools/configs/palette.example.json` and show the table.
g. **Languages, print and export.** Is there more than one language? Print or PDF export? Excel or CSV export? Keep all of them working.
h. **Brand.** Is there a logo, brand colour or style guide I must respect? If yes, keep it and ask before changing it.

## 3. Baseline (before the first edit)

- Create the branch: `git checkout -b design-layer`.
- Record the baseline: `git rev-parse HEAD` (call it BASE).
- Capture screenshots of every page and state at 1600 px and 390 px wide.
- If it is a single HTML file, copy the original untouched as `dashboard_original.html`.

## 4. Build, in this order (one commit per step, small and reversible)

**Step A, one palette.** Define colour tokens (CSS variables) once: primary, primary dark, secondary, secondary light and lighter tints, accent (the single loud colour), text on accent, greys for text, lines and surfaces, warning or sample colour (plus dark and tint), ok colour, page background, hero background. Replace every hard coded colour (stylesheets AND colours drawn by chart code) with a token, so one change recolours everything. Choose the palette as two quiet colours plus one loud accent used once per screen (for example main button, active step, focus ring, progress line). Never use the accent as small text on a light background. Keep semantic colours consistent (for example samples are always the same colour everywhere, warnings always the same).

**Step B, structure and usability.** Compact header and intro so the work starts near the top. On screens 1500 px or wider, move the step navigation to a left rail that stays in view. Let content width grow with the screen. Tighter vertical spacing. Reading progress line. Highlight the current step. Skip to content link. Visible focus ring. Keyboard: `J` and `K` to move between sections, `?` for help, `C` for Customize. Table row highlight and aligned digits. Calm by default.

**Step C, interactive explorer.** Add a read only panel under the results using Apache ECharts 5.5.1 (or Plotly if the app is Python and already uses it). Charts: results with 95 percent ranges (or the dashboard's own uncertainty measure), and the standard curve or the dashboard's main relationship. Hover shows the dashboard's own formatted numbers. Wheel or drag zooms. Match the dashboard's own meaning of colour. No transitions. Hidden in print. For a single HTML page run `python port_kit/tools/fetch_echarts.py` and inline it with `layer_build.py` because of the content security policy.

**Step D, Customize panel.** One settings object drives everything: colour theme (at least: default, an alternative, a neutral slate, graphite for print, colour blind safe), accent colour, text size 90 to 125 percent, spacing, heading font, corner shape, contrast, navigation position, intro size, motion, and plot options (bars or dots, value labels, grid, mark size, label size, range on or off, sort, log axis, plot palette). Reset, export settings to a JSON file, import settings. Store nothing in the browser unless the user ticks "Remember on this device", and say so in the panel. Keep English and any other language the dashboard has.

## 5. Stack mapping (how to apply each step)

| Stack | Palette | Explorer | Panel and shortcuts |
|---|---|---|---|
| Single HTML file | `layer_build.py` recolours its stylesheet and adds token overrides for SVG attributes | inline ECharts, read the exposed state object | inject `layer/*.js` and `*.css` |
| React or Vue | tokens in a global stylesheet, replace literals in components | `echarts-for-react` or a small wrapper component fed from the existing store or props | a settings context plus a drawer component, CSS variables set on the root element |
| Plotly Dash | a CSS file in `assets/` with tokens, a Plotly template for figures | add `dcc.Graph` figures built from the same dataframe the existing callbacks use, never a new calculation | a layout drawer with `dcc.Store` for settings (memory storage by default) and clientside callbacks for CSS variables |
| Streamlit | `.streamlit/config.toml` theme plus injected CSS | `st.plotly_chart` or `streamlit-echarts` from the dataframe already in session state | sidebar controls writing to `st.session_state`, injected CSS variables |
| R Shiny | `bslib` theme plus a CSS file | `plotly` or `echarts4r` from the reactive already computed | a settings offcanvas panel, CSS variables through `shinyjs` or a small script |

Always feed charts from the already computed object. Never call the fitting or statistics code a second time to draw.

## 6. Verification (all of it, every time, and paste the outputs in your report)

1. **Science untouched.**
   - Git projects: `python port_kit/tools/integrity_check.py git --base BASE --protect <protected globs from step 2b>`
   - Single HTML: `python port_kit/tools/integrity_check.py html --original dashboard_original.html --built <new file> --ignore-id ...` (ignore the layer's own element ids)
2. **Colours consistent.** Run the colour audit on the result. Remaining hard coded colours must be listed and justified (for example third party code).
3. **Plots equal the numbers.** Copy and adapt `port_kit/tools/configs/fidelity.example.json` (the example data steps and the two JavaScript expressions that return what is plotted and what the dashboard computed). Run `python port_kit/tools/fidelity_test.py <config>`. It must say ALL EQUAL, also after the setting changes.
4. **Quality.** Adapt `port_kit/tools/configs/qa.example.json` and run `python port_kit/tools/qa_check.py <config>`. It must say ALL PASS: no sideways scroll on a phone, no console errors, no endless animation by default or with reduced motion, text contrast at least 4.5, visible keyboard focus, the layer hidden in print.
5. **Exports still work.** Print or PDF, CSV and Excel (if present) still produce the same numbers as before.
6. **Look at the screenshots yourself.** Compare against the baseline screenshots at 1600 and 390 px, and fix anything that looks broken. Wait for scrolling to settle before judging a screenshot.

If any check fails, fix it or revert that step. Do not weaken a check to make it pass.

## 7. Report (end of the work)

Give me, in plain language:
- what changed, by step, with commit ids;
- the exact outputs of the tools in section 6;
- what you could NOT test (for example real data files, other browsers, other languages) and why;
- anything you noticed that looks scientifically questionable. Report it, do not change it;
- questions you still have.

Start now with section 2 and stop after showing me the findings.
