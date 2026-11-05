# Animation toolkit

## Skills installed (in `skills_external/animation/`)

| Skill set | From | Licence | Use it for |
|---|---|---|---|
| `hyperframes/` (9 skills) | `heygen-com/hyperframes` (79k stars) | Apache 2.0 | Write HTML, render it to video. Best for an offline intro film, GIF or demo video of the dashboard, not for the live page. Audio, font and test files left out. |
| `gsap_skills/` (8 skills) | `greensock/gsap-skills` (17.9k) | MIT | Official GSAP guidance: timelines, ScrollTrigger, React, performance, reduced motion. |
| `lottie/text-to-lottie` | `diffusionstudio/lottie` (5.7k) | MIT | Generate small vector Lottie animations, including a logo recipe and loaders. |

Also available, not copied (large or different purpose): `Tejashmakwana/motionmaxxing` (motion graphics films, Apache 2.0), `nexu-io/html-video` (HTML to MP4, Apache 2.0), `zhuyansen/awesome-claude-video-skills` (a list of 180 video skill repos).

## Libraries (stars from GitHub, 5 November 2026)

| Library | Stars | Licence | Good for a calm scientific dashboard |
|---|---|---|---|
| anime.js | 74k | MIT | Small, simple timelines. Good for a logo reveal. |
| Motion (`motiondivision/motion`) | 35k | MIT | Polished micro interactions in React or plain JavaScript. |
| GSAP | 30k | GreenSock licence (free, not open source; check before shipping) | The most capable timeline engine, with an official skill set. |
| Lottie web | 32k | MIT | Plays After Effects or generated Lottie files. Needs a designer or the skill above. |
| dotLottie web | 0.9k | MIT | Smaller, faster Lottie player. |
| Vivus | 15k | MIT | Draws SVG paths stroke by stroke. Ideal for drawing a logo outline. |
| Theatre.js | 13k | Apache 2.0 | Visual editor for timing. Heavy for a simple loader. |
| AutoAnimate | 14k | MIT | Smooth reorder when sorting lists and tables. |
| react-spring | 29k | MIT | Spring physics for React. |
| Rive | 1k | MIT | Interactive animations with a visual editor. |
| Lenis | 17k | MIT | Smooth scrolling. Not recommended for data tools: it changes how scrolling feels. |
| mo.js | 19k | MIT | Playful bursts. Too lively for long use. |
| Remotion | 71k | special licence (company use may need a paid licence) | React to video, offline. |

## Loading screen, first thoughts (to discuss once the dashboard is here)

- It must show **real readiness**, not a fake delay. Hold the screen only until the page and chart library are ready, then fade out. Never longer than about 1.5 seconds.
- **Once per visit**, skippable by click or key, and never again on in page navigation.
- Logo drawn stroke by stroke (SVG) then settling, in the dashboard's own palette. One gesture, then quiet.
- **Reduced motion:** a still logo that fades. Print and PDF export never show it.
- It must not hide load errors: if something fails, show the message.
- Works from a single file with no network (inline SVG and a tiny script, no library needed for the simple version).
