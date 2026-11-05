# Hydra molecular entrance

A 2.5 second entrance for the dashboard: a hydrophobic molecule reorganizes the surrounding water, and that molecular event becomes the dashboard. One file (`hydra_entrance.js`, raw WebGL2, no 3D library) plus GSAP (the only dependency) for the master timeline.

It changes appearance only. It never reads or changes dashboard data.

## Sequence (2.5 s, one continuous choreography)

| Time | What happens |
|---|---|
| 0.0 to 0.6 s | Near black (#080B10). An atmospheric glow rises. A hydrophobic cage (10 carbon and 16 hydrogen atoms, polished metal) materializes atom by atom with growing bonds. 64 water molecules (one oxygen and two hydrogens, liquid glass) enter from different directions with fine trails and depth. |
| 0.6 to 1.7 s | Water spirals in and reorganizes into a coordinated shell around the cage: about three quarters form an inner shell, the rest are displaced to an outer one, oriented tangentially. Hydrogen bonds between neighbours flash as they settle. The cage pulses (small at 1.3 s, strong at 1.7 s). |
| 1.7 to 2.5 s | The pulse releases the water into fine luminous particles that move outward and dissolve. The cage contracts into a logo made of light (the drop), the dark fades into the dashboard, the dashboard elements rise in with opacity and a 10 px slide, and the logo docks into the header. Everything is fully visible and interactive at 2.5 s. |

No spinner, no hard cut, no bounce. Easing is cubic bezier throughout.

## Use

```html
<!-- 1. first thing in <body>: a dark cover so the dashboard never flashes before the animation -->
<style>#he-cover{position:fixed;inset:0;z-index:2147483000;background:#080B10}</style>
<div id="he-cover"></div>
...
<!-- 2. at the end of <body> -->
<script src="gsap.min.js"></script>
<script src="hydra_entrance.js"></script>
<script>
  HydraEntrance.play({
    reveal: ['.topbar', '.sidebar', 'main'],        // what fades in during the last 0.8 s
    logo: { path: 'M50 7 C...', viewBox: [0,0,100,100], fill: '#63DDF5', fillRule: 'evenodd' },
    logoTarget: '.topbar .logo',                    // where the logo docks (optional)
    onDone: function () { /* the dashboard is ready */ }
  });
</script>
```

React: call `HydraEntrance.play(...)` once in a `useEffect(() => { const c = HydraEntrance.play(opts); return () => c.destroy(); }, [])` of the app shell, and render the dashboard normally underneath. Never put the dashboard behind a loading flag: the animation is the entrance, not a gate.

Options: `reveal`, `logo` (an SVG path, drawn as light then shown as the real logo), `logoTarget`, `duration` (default 2.5), `molecules` (default 64, 36 on small screens), `seed`, `onDone`, `paused` (for testing).
Controller: `seek(t)` (paused mode), `skip()`, `destroy()`, `timeline`, `done`, `stats`, `timing`.

## Behaviour that matters

- **Real time:** driven by the wall clock, so it lasts 2.5 s even if frames drop. GSAP's lag smoothing (which would stretch it on a busy page) is not used and no global GSAP setting is touched.
- **Skip:** any click, tap or key fast forwards the same choreography (about 1.2 s), no cut.
- **Clicks:** the overlay blocks clicks until the reveal starts (1.7 s), then lets everything through.
- **Reduced motion** (`prefers-reduced-motion`): no animation at all, the dashboard is simply there.
- **No WebGL2, or any error:** falls back to no animation, the dashboard is simply there.
- **Clean up:** timeline killed, animation frame cancelled, WebGL context released, overlay removed, inline styles cleared.
- **Phone:** fewer molecules (36), pixel ratio capped at 2.

## Verified (in a browser, on the gel densitometry dashboard as a stand in)

Frame by frame render without errors; 2528 ms of real time (target 2500); dashboard interactive at the end (its own controls and example data work); overlay and canvas removed; reveal elements fully opaque at the end; clicks pass through from 1.7 s; skip finishes in 1.2 s; reduced motion shows no overlay; no WebGL falls back cleanly; 390 by 844 phone has no overflow or errors; JavaScript cost per frame about 1 to 2 ms.

## Not verified (be aware)

- **60 FPS on a real graphics card.** This was built and tested in a sandbox with software rendering, which cannot show real frame rates. The design is light (three draw calls, instanced, under 1000 quads, preallocated buffers, no per frame allocation), so it should be easy for a GPU, but measure on your target devices.
- **Real phones and other browsers** (Safari, Firefox).
- **The real Hydra dashboard and logo.** The drop logo is a placeholder: send the real logo as an SVG path and it takes its place. The header docking was tested against another dashboard's header.
- **Setup time.** The sandbox took 1.4 s to compile and draw the first frame; a real GPU should take well under 200 ms. The dark cover hides it, but check it.

## Science note

The picture is schematic. Real hydrophobic hydration around a small solute does not form a rigid, evenly spaced cage of tangentially oriented molecules, and the cage drawn here is adamantane like for looks. The reorganization is artistically exaggerated, as the brief allows. If a scientist will read it literally, say so in the product copy or tone down the shell.

## Licences

`hydra_entrance.js`: yours to license. GSAP 3.12.7 is free to use but not open source (GreenSock standard licence, https://gsap.com/standard-license). Raw WebGL2 means no Three.js is needed. HyperFrames was not used (it is for offline video, not live rendering).

## Tests (`tests/`)

`make_host.py base.html host.html` builds a host page (set `reveal` and `logoTarget` inside it to match your dashboard). Then `HOST_URL=file:///abs/host.html node tests/frames.js` (key frames), `realtime.js` (real time, interaction, reduced motion, phone, no WebGL), `behaviour.js` (click blocking, skip), `video.js` (renders the frames; encode with `ffmpeg -framerate 30 -i vf/f_%03d.png -c:v libx264 -pix_fmt yuv420p preview.mp4`). They need Node and Playwright, and software rendering flags are in the scripts.
