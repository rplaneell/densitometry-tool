# Port kit: bring the design layer and interactive plots to the Hydra dashboard

What is here:

| Path | What it is |
|---|---|
| `PROMPT.md` | The master prompt. Paste it into Claude Code (started in this repository). It discovers the stack, protects the science, applies the features in order and proves each step with the tools. |
| `tools/colour_audit.py` | Lists every colour used and suggests the nearest palette token. Read only. |
| `tools/layer_build.py` | Single file HTML only: injects the design layer and chart library without touching the page's own scripts, and proves the scripts are unchanged. |
| `tools/integrity_check.py` | Proves the science is untouched. `html` mode for single files, `git` mode for any project in git (protected paths must be identical to a base commit). |
| `tools/fidelity_test.py` | Browser test: what the interactive charts plot must equal what the dashboard computed, exactly, before and after setting changes. |
| `tools/qa_check.py` | Browser test: phone width, errors, motion, contrast, keyboard, print. |
| `tools/fetch_echarts.py` | Downloads the pinned Apache ECharts 5.5.1 and checks its checksum. |
| `tools/configs/` | Working example configs (written for the gel densitometry page; adapt them). |
| `layer/` | The reference layer: `usability`, `theme_and_structure`, `explorer`, `customize_panel` (CSS and JS). |

## Setup (once)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r port_kit/requirements.txt
python -m playwright install chromium
```

If Chrome or Chromium is already installed, skip the last command and add `--browser-path /path/to/chrome` to `fidelity_test.py` and `qa_check.py`.

## Typical use

```bash
python port_kit/tools/colour_audit.py . --palette port_kit/tools/configs/palette.example.json
python port_kit/tools/fetch_echarts.py
python port_kit/tools/layer_build.py port_kit/tools/configs/layer_build.example.json
python port_kit/tools/integrity_check.py html --original dashboard_original.html --built dashboard_new.html --ignore-id pl-progress --ignore-id pl-skip --ignore-id pl-help --ignore-id pl-explore --ignore-id pl-cust --ignore-id pl-cust-btn
python port_kit/tools/fidelity_test.py port_kit/tools/configs/fidelity.example.json
python port_kit/tools/qa_check.py port_kit/tools/configs/qa.example.json
```

For a project that is not a single HTML file, use the git mode instead:

```bash
python port_kit/tools/integrity_check.py git --base main --protect "src/calc/**" "data/**"
```

## Colour tokens the reference layer expects

`--werfen` primary, `--werfen-deep` primary dark, `--blue500` secondary, `--blue300` and `--blue100` light tints, `--jade` the single loud accent, `--on-accent` text on the accent, `--g050` `--g200` `--g500` `--g700` greys (surface, line, muted text, text), `--orange` `--orange-deep` `--orange-tint` the sample and warning colour, `--teal` the ok colour, `--page` page background, `--hero` hero background. The names come from the first dashboard; rename them consistently if you prefer (search and replace in `layer/` and in the config).

## Tested

The tools were run on the gel densitometry dashboard: `layer_build.py` (scripts intact), `integrity_check.py` in both modes (pass, and fail when a calculation file changes), `fidelity_test.py` (all plotted values exactly equal the page's numbers, before and after four setting changes) and `qa_check.py` (14 of 14 checks). They have not yet been run on the Hydra dashboard.

Secrets: API keys go only in a local `.env` file (never committed). `.env.example` lists variable names with empty values.
