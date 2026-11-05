# Hydra entrance (marketing cut)

A 2.6 second product film shot that becomes the dashboard. One idea, told the way a hydrophobic surface really behaves: **water beads up**.

1. **0.0 to 0.5 s.** Dark, rough, grainy surface with a soft horizon. Clear liquid glass beads of many sizes form, like drops on a water repelling mat. A light sweep travels over the grain and makes it sparkle.
2. **0.4 to 1.4 s.** The beads roll together and merge (smooth surface tension blobs) into one domed hero bead. The camera pushes in slowly.
3. **1.4 to 2.0 s.** The bead settles with a small wobble, lifts off the surface into a clear glass sphere, and a second light sweep passes. The wordmark ("Hydra") reveals letter by letter under it.
4. **2.0 to 2.6 s.** The scene dissolves into the dashboard (the sphere clears, the dashboard sections rise in). It ends on the finished, fully interactive dashboard.

No molecules, atoms or bonds. No spinner, no hard cut. **There is no default logo:** the earlier placeholder drop looked like an upside down map pin, so it was removed. Pass `logo` only when you have the real one.

The molecular version (atoms, water molecules, hydrogen bonds) is kept as `hydra_entrance_molecular.js` for science heavy audiences. It uses the same API.

## Use

```html
<style>#he-cover{position:fixed;inset:0;z-index:2147483000;background:#080B10}</style>
<div id="he-cover"></div>      <!-- first thing in body: no flash before the animation -->
...
<script src="gsap.min.js"></script>
<script src="hydra_entrance.js"></script>
<script>
  HydraEntrance.play({
    title: 'Hydra',                                 // wordmark ('' for none)
    reveal: ['.topbar', '.sidebar', 'main'],        // what rises in at the end
    // logo: { path: 'M...', viewBox: [0,0,100,100], fill: '#63DDF5', fillRule: 'evenodd' },  // optional, real logo only
    // logoTarget: '.topbar .logo',                 // where that logo docks
    quality: 'auto',                                // 'low' | 'auto' | 'high'
    onDone: function () {}
  });
</script>
```

React: `useEffect(() => { const c = HydraEntrance.play(opts); return () => c.destroy(); }, [])` in the app shell, with the dashboard rendered normally underneath. Never gate the dashboard on the animation.

Controller: `seek(t)` (with `paused: true`), `skip()`, `destroy()`, `timeline`, `done`, `stats`, `timing`.

## Behaviour

- **Wall clock.** Always 2.6 real seconds, whatever the frame rate (frames are skipped on a slow machine). GSAP's lag smoothing is not used.
- **Quality governor.** Renders within a pixel budget (about 2 megapixels, 1 on phones) and lowers the resolution automatically if frames run slow. The title and any logo are crisp vector drawn over it. `quality: 'high'` allows about 8 megapixels.
- **Skip:** a click, tap or key fast forwards the same choreography.
- **Clicks** pass through from 1.95 s.
- **Reduced motion, no WebGL2, or any error:** no animation, the dashboard is simply there.
- **Clean up:** timeline killed, frame loop cancelled, WebGL context released, overlay removed.

## Verified

- Compiles and renders without errors (seek mode, frame by frame) on the glass dashboard; frames and a video preview were reviewed against two reference photos (water beads on a dark textured mat; a single bead on a leaf).
- **Timeline timing:** 2604 ms for a 2600 ms target, measured at a small render size where software rendering can keep up.
- The optional logo path (sphere to a smooth glass shape, hand over to the vector logo, dock) renders correctly with a neutral ring logo.
- The dashboard is interactive after the animation (checked on the molecular version of the same shell; the clean up and reveal code are shared).

## Not verified, and a warning

- **Real graphics card speed.** This sandbox only has software rendering, which takes 0.2 to 0.4 s per frame at small sizes, so the frame rate cannot be measured here. My estimate is that the shader is heavy (a raymarched scene with reflections): it is fine on a desktop GPU and a recent laptop at 1 to 2 megapixels, and may need the governor on weak laptops and phones. **Measure it on your slowest target device.**
- **4K.** The scene is rendered at about 2 megapixels and scaled up by the browser (glass is soft by nature, and the title and logo stay razor sharp). Use `quality: 'high'` on strong GPUs.
- Real phones, Safari and Firefox; the real Hydra dashboard and logo.
- The glass ring shows faint vertical streaks mid morph when a logo is used. Edges of an unusual logo may need tuning.

## Science note

Beads on a hydrophobic surface are real physics (contact angle, surface tension, coalescence), but this is an art shot, not a simulation: sizes, speeds and the lift off are exaggerated.

## Licences

`hydra_entrance.js` is yours to license. GSAP 3.12.7 is free to use but not open source (https://gsap.com/standard-license). No 3D library is used.

## Tests (`tests/`)

`make_host.py base.html host.html hydra_entrance.js` builds a host page. Then `HOST_URL=file:///abs/host.html node tests/frames.js 0.3,0.9,1.5,2.2` (key frames, needs `#seek`), `wall_clock.js` (real time duration at small sizes), `video.js` (frames for a video). Node and Playwright are required; the scripts use software rendering flags.
