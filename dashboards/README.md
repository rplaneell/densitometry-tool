# Dashboard design trial

`proteinquant_polished_trial.html` is the gel densitometry page with a new visual layer added on top. Nothing scientific was changed: the visible text and the chart markup were compared with the original in a browser and are identical.

`polish_layer/` holds the three blocks that were injected (`theme.css` for colour, type and shape, `polish.css` and `polish.js` for usability). Removing them gives back the original file byte for byte.

`proteinquant_ORIGINAL_untouched.html` is the file exactly as received, kept for comparison.

The polished page starts in the page's own calm mode (no endless animations). The Animations switch in the top bar turns motion back on. In calm mode the hero's looping demo counter stays on its final value (27.4 mg/L) instead of cycling from 0.0.
