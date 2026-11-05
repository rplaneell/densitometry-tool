/*GLASS-JS water droplets on the glass scene: decoration only. Static when motion is calm or reduced.*/
(function () {
  try {
    var d = document, cv = d.createElement('canvas'); cv.id = 'pl-drops'; cv.setAttribute('aria-hidden', 'true');
    d.body.insertBefore(cv, d.body.firstChild);
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, drops = [], on = false, anim = false, raf = 0, last = 0;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    function size() {
      var cw = window.innerWidth, ch = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(8.3e6 / (cw * ch))); // sharp on 4K, never more than about 8 megapixels
      W = cv.width = Math.round(cw * dpr); H = cv.height = Math.round(ch * dpr); seed(cw, ch);
    }
    function seed(cw, ch) {
      var r = rng(7), n = Math.round(cw * ch / 36000); drops = [];
      for (var i = 0; i < n; i++) { var s = 1.6 + Math.pow(r(), 3.4) * 24; drops.push({ x: r() * cw, y: r() * ch, s: s, v: (0.5 + r() * 1.1) * (0.35 + s / 26), a: 0.35 + r() * 0.65 }); }
    }
    function drop(p) {
      var x = p.x, y = p.y, s = p.s, g = ctx.createRadialGradient(x - s * 0.3, y - s * 0.34, s * 0.04, x, y, s);
      g.addColorStop(0, 'rgba(255,255,255,' + 0.55 * p.a + ')'); g.addColorStop(0.2, 'rgba(190,225,250,' + 0.22 * p.a + ')');
      g.addColorStop(0.72, 'rgba(70,130,190,' + 0.12 * p.a + ')'); g.addColorStop(1, 'rgba(205,232,255,' + 0.34 * p.a + ')');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s, 0, 6.2832); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,' + 0.9 * p.a + ')'; ctx.beginPath(); ctx.arc(x - s * 0.32, y - s * 0.36, Math.max(0.6, s * 0.13), 0, 6.2832); ctx.fill();
    }
    function paint() { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); if (on) for (var i = 0; i < drops.length; i++) drop(drops[i]); }
    function tick(now) {
      raf = 0; if (!on || !anim || reduce || document.hidden) return;
      if (now - last > 33) { var dt = Math.min(0.1, (now - last) / 1000); last = now; var ch = window.innerHeight, cw = window.innerWidth;
        for (var i = 0; i < drops.length; i++) { var p = drops[i]; p.y -= p.v * dt * 6; if (p.y < -p.s) { p.y = ch + p.s; p.x = Math.random() * cw; } } paint(); }
      raf = requestAnimationFrame(tick);
    }
    window.__plGlass = { set: function (o) { on = !!o.on; anim = !!o.anim; cv.style.display = on ? '' : 'none'; if (on && !W) size(); paint(); if (on && anim && !raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(tick); } } };
    var rt = 0; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (on) { size(); paint(); } }, 150); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && on && anim && !raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(tick); } });
  } catch (e) { }
})();
