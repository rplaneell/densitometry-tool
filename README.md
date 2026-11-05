# Skills collection

A set of Agent Skills (reusable instruction packs for Claude and other AI agents), gathered while working on interactive scientific result dashboards.

Source: the public repository `anthropics/skills`, copied at commit `ca45fc496a3436251f191354091d557da31c15b5` (28 October 2026). Each skill keeps its own `LICENSE.txt` (Apache License 2.0).

Skills most useful for dashboards: `frontend-design` (visual design direction), `webapp-testing` (browser tests with Playwright), `web-artifacts-builder`, `theme-factory`, `canvas-design`, `algorithmic-art`.

Not included on purpose: `docx`, `pdf`, `pptx` and `xlsx` have a proprietary "all rights reserved" licence that does not allow copying, and `doc-coauthoring` ships without a licence file. Get them from the original repository.

Secrets: API keys go only in a local `.env` file, which `.gitignore` blocks. `.env.example` lists the variable names with empty values.

Third party skill added: `skills_external/dashboard-design` from `abdiraimov-otabek/dashboard-design-skill` (commit b813324), kept with its own LICENSE. It is a design guide with no scripts.

Plot skills: `skills/interactive-scientific-plots` (written from this project: how to add interactive, customizable plots without changing any computed number) and `skills_external/k_dense_scientific_skills` (`scientific-visualization`, `matplotlib`, `seaborn` from `K-Dense-AI/scientific-agent-skills`, MIT).

Animation skills: `skills_external/animation/` (HyperFrames, official GSAP skills, text to Lottie). Guide and library comparison: `docs/ANIMATION_TOOLKIT.md`. Plan for the Hydra dashboard: `docs/INTAKE_PLAN.md`.
