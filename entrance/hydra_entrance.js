/*!
 * Hydra molecular entrance: a hydrophobic molecule reorganizes the surrounding water, then becomes the dashboard.
 * 2.5 seconds, raw WebGL2 (no 3D library), GSAP master timeline (GSAP is the only dependency).
 * Appearance only: it never reads or changes any dashboard data.
 *
 *   HydraEntrance.play({
 *     reveal: ['.topbar', '.sidebar', 'main'],      // elements that fade in at the end (selectors or elements)
 *     logo: { path: 'M50 8 ...', viewBox: [0, 0, 100, 100], fill: '#63DDF5', fillRule: 'evenodd' },
 *     logoTarget: '.site-header .brand',           // where the logo docks (optional)
 *     duration: 2.5, paused: false, onDone: fn
 *   })  ->  controller { seek(t), skip(), destroy(), timeline }
 */
(function (root) {
  'use strict';

  var DEFAULT_LOGO = {
    path: 'M50 7 C62 25 83 43 83 63 A33 33 0 0 1 17 63 C17 43 38 25 50 7 Z M50 63 m-13 0 a13 13 0 1 0 26 0 a13 13 0 1 0 -26 0 Z',
    viewBox: [0, 0, 100, 100], fill: '#63DDF5', fillRule: 'evenodd'
  };
  var COL = { cyan: [0.388, 0.867, 0.961], ice: [0.659, 0.914, 0.961], silver: [0.80, 0.85, 0.89] };

  /* ---------- small math helpers ---------- */
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function sm(a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  // cubic-bezier easing (same maths as CSS)
  function bez(x1, y1, x2, y2) {
    function cx(t) { return 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t; }
    function cy(t) { return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t; }
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      var lo = 0, hi = 1, t = x;
      for (var i = 0; i < 18; i++) { t = (lo + hi) / 2; if (cx(t) < x) lo = t; else hi = t; }
      return cy(t);
    };
  }
  var easeOut = bez(0.22, 1, 0.36, 1), easeInOut = bez(0.65, 0, 0.35, 1), easeArrive = bez(0.32, 0, 0.14, 1);
  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function qAxis(ax, ang) { var s = Math.sin(ang / 2); return [ax[0] * s, ax[1] * s, ax[2] * s, Math.cos(ang / 2)]; }
  function qMul(a, b) { return [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]]; }
  function qSlerp(a, b, t) {
    var d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3], s = 1;
    if (d < 0) { d = -d; s = -1; }
    var k0, k1;
    if (d > 0.9995) { k0 = 1 - t; k1 = t * s; }
    else { var th = Math.acos(d), sn = Math.sin(th); k0 = Math.sin((1 - t) * th) / sn; k1 = Math.sin(t * th) / sn * s; }
    var r = [a[0] * k0 + b[0] * k1, a[1] * k0 + b[1] * k1, a[2] * k0 + b[2] * k1, a[3] * k0 + b[3] * k1], l = Math.hypot(r[0], r[1], r[2], r[3]) || 1;
    return [r[0] / l, r[1] / l, r[2] / l, r[3] / l];
  }
  function qRot(q, v) {
    var x = q[0], y = q[1], z = q[2], w = q[3];
    var tx = 2 * (y * v[2] - z * v[1]), ty = 2 * (z * v[0] - x * v[2]), tz = 2 * (x * v[1] - y * v[0]);
    return [v[0] + w * tx + (y * tz - z * ty), v[1] + w * ty + (z * tx - x * tz), v[2] + w * tz + (x * ty - y * tx)];
  }
  function qFromCols(X, Y, Z) { // rotation matrix with columns X,Y,Z
    var m00 = X[0], m01 = Y[0], m02 = Z[0], m10 = X[1], m11 = Y[1], m12 = Z[1], m20 = X[2], m21 = Y[2], m22 = Z[2], tr = m00 + m11 + m22, q;
    if (tr > 0) { var s = Math.sqrt(tr + 1) * 2; q = [(m21 - m12) / s, (m02 - m20) / s, (m10 - m01) / s, 0.25 * s]; }
    else if (m00 > m11 && m00 > m22) { var s1 = Math.sqrt(1 + m00 - m11 - m22) * 2; q = [0.25 * s1, (m01 + m10) / s1, (m02 + m20) / s1, (m21 - m12) / s1]; }
    else if (m11 > m22) { var s2 = Math.sqrt(1 + m11 - m00 - m22) * 2; q = [(m01 + m10) / s2, 0.25 * s2, (m12 + m21) / s2, (m02 - m20) / s2]; }
    else { var s3 = Math.sqrt(1 + m22 - m00 - m11) * 2; q = [(m02 + m20) / s3, (m12 + m21) / s3, 0.25 * s3, (m10 - m01) / s3]; }
    var l = Math.hypot(q[0], q[1], q[2], q[3]) || 1; return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
  }
  function randUnit(r) { var z = r() * 2 - 1, a = r() * 6.2832, s = Math.sqrt(1 - z * z); return [s * Math.cos(a), z, s * Math.sin(a)]; }

  /* ---------- scene: a hydrophobic cage (adamantane like, 10 C and 16 H) and water ---------- */
  function buildScene(rng, N, NL, logoPath, vb) {
    var sc = 0.92, B = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map(function (p) { return [p[0] * 0.62 * sc, p[1] * 0.62 * sc, p[2] * 0.62 * sc]; });
    var atoms = [], bonds = [], i, j;
    B.forEach(function (p) { atoms.push({ p: p, r: 0.36, kind: 1 }); });
    var axes = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    axes.forEach(function (a) {
      var pos = [a[0] * 1.18 * sc, a[1] * 1.18 * sc, a[2] * 1.18 * sc], idx = atoms.length;
      atoms.push({ p: pos, r: 0.33, kind: 1 });
      var near = [];
      B.forEach(function (b, k) { near.push([Math.hypot(b[0] - pos[0], b[1] - pos[1], b[2] - pos[2]), k]); });
      near.sort(function (x, y) { return x[0] - y[0]; });
      var b0 = B[near[0][1]], b1 = B[near[1][1]];
      bonds.push([idx, near[0][1]], [idx, near[1][1]]);
      var perp = norm(cross(a, [b0[0] - b1[0], b0[1] - b1[1], b0[2] - b1[2]]));
      [1, -1].forEach(function (sg) {
        var h = [pos[0] + a[0] * 0.5 * sc + perp[0] * 0.78 * sg * sc, pos[1] + a[1] * 0.5 * sc + perp[1] * 0.78 * sg * sc, pos[2] + a[2] * 0.5 * sc + perp[2] * 0.78 * sg * sc];
        bonds.push([idx, atoms.length]); atoms.push({ p: h, r: 0.17, kind: 1, h: 1 });
      });
    });
    B.forEach(function (b, k) {
      var d = norm(b), h = [b[0] + d[0] * 0.95 * sc, b[1] + d[1] * 0.95 * sc, b[2] + d[2] * 0.95 * sc];
      bonds.push([k, atoms.length]); atoms.push({ p: h, r: 0.17, kind: 1, h: 1 });
    });
    atoms.forEach(function (a, k) { a.delay = (a.h ? 0.18 : 0) + (k % 7) * 0.016 + rng() * 0.05; });

    // water molecules
    var water = [], nIn = Math.round(N * 0.74), nOut = N - nIn, GA = Math.PI * (3 - Math.sqrt(5));
    function fib(k, n, off) { var y = 1 - (k + 0.5) / n * 2, rr = Math.sqrt(1 - y * y), th = k * GA + off; return [Math.cos(th) * rr, y, Math.sin(th) * rr]; }
    for (i = 0; i < N; i++) {
      var inner = i < nIn, dir = inner ? fib(i, nIn, 0.3) : fib(i - nIn, nOut, 1.9), R = inner ? 2.62 + rng() * 0.16 : 3.6 + rng() * 0.2;
      var n = dir, ref = Math.abs(n[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0], t1 = norm(cross(n, ref)), ph = rng() * 6.2832;
      var bis = [t1[0] * Math.cos(ph) + cross(n, t1)[0] * Math.sin(ph), t1[1] * Math.cos(ph) + cross(n, t1)[1] * Math.sin(ph), t1[2] * Math.cos(ph) + cross(n, t1)[2] * Math.sin(ph)];
      bis = norm(bis); var w = norm(cross(bis, n)); // molecule plane = tangent plane: x=w, y=bisector, z=normal
      var far = randUnit(rng), fr = 9.5 + rng() * 4, mid = norm([far[0] * 0.55 + (rng() - 0.5) * 1.2, far[1] * 0.55 + (rng() - 0.5) * 1.2, far[2] * 0.55 + (rng() - 0.5) * 1.2]), mr = 4.0 + rng() * 2.2;
      water.push({
        target: [n[0] * R, n[1] * R, n[2] * R], n: n, qT: qFromCols(w, bis, n),
        far: [far[0] * fr, far[1] * fr, far[2] * fr], mid: [mid[0] * mr, mid[1] * mr, mid[2] * mr],
        ax: randUnit(rng), om: (rng() < 0.5 ? -1 : 1) * (1.4 + rng() * 1.8), q0: qAxis(randUnit(rng), rng() * 6.28),
        d: rng() * 0.3, swirl: (rng() < 0.5 ? -1 : 1) * (0.8 + rng() * 1.1), ph: [rng() * 6.28, rng() * 6.28, rng() * 6.28], fq: [0.7 + rng() * 0.9, 0.6 + rng() * 0.9, 0.8 + rng() * 0.8],
        off: rng(), spawn: [randUnit(rng), randUnit(rng), randUnit(rng)], inner: inner
      });
    }
    // hydrogen bond network between neighbours of the shell
    var hb = [];
    for (i = 0; i < N; i++) for (j = i + 1; j < N; j++) {
      var a = water[i].target, b = water[j].target, dd = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      if (dd < 1.05 && water[i].inner === water[j].inner) hb.push([i, j]);
    }
    // logo points from a Path2D mask (synchronous)
    var logo = [];
    try {
      var cv = document.createElement('canvas'), S = 128; cv.width = cv.height = S;
      var cx = cv.getContext('2d'), p2 = new Path2D(logoPath);
      cx.scale(S / vb[2], S / vb[3]); cx.translate(-vb[0], -vb[1]); cx.fillStyle = '#fff'; cx.fill(p2, 'evenodd');
      var px = cx.getImageData(0, 0, S, S).data, cand = [];
      for (var yy = 0; yy < S; yy += 1) for (var xx = 0; xx < S; xx += 1) if (px[(yy * S + xx) * 4 + 3] > 128) cand.push([xx / S, yy / S]);
      for (i = 0; i < NL && cand.length; i++) { var c = cand[Math.floor(rng() * cand.length)]; logo.push([c[0] - 0.5, 0.5 - c[1]]); }
    } catch (e) { /* logo dust is optional */ }
    return { atoms: atoms, bonds: bonds, water: water, hb: hb, logo: logo };
  }

  /* ---------- shaders ---------- */
  var VS_SPHERE = '#version 300 es\nlayout(location=0) in vec2 aC;layout(location=1) in vec4 iP;layout(location=2) in vec4 iCol;layout(location=3) in vec2 iK;uniform mat4 uV,uP;out vec2 vUV;out vec4 vCol;out vec2 vK;void main(){vec4 vp=uV*vec4(iP.xyz,1.);vp.xy+=aC*iP.w;vUV=aC;vCol=iCol;vK=iK;gl_Position=uP*vp;}';
  var FS_SPHERE = '#version 300 es\nprecision highp float;in vec2 vUV;in vec4 vCol;in vec2 vK;out vec4 o;\n' +
    'const vec3 CY=vec3(.388,.867,.961);const vec3 IC=vec3(.659,.914,.961);\n' +
    'void main(){float r2=dot(vUV,vUV);float k=vK.x;\n' +
    'if(k>1.5){ if(k>2.5){float rr=sqrt(r2);float ring=exp(-pow((rr-vK.y)/.07,2.))*pow(1.-vK.y,1.4);o=vec4(mix(CY,IC,.5)*ring*vCol.a,0.);return;}\n' +
    ' float a=exp(-r2*3.2)*vCol.a;o=vec4(vCol.rgb*a,0.);return;}\n' +
    'if(r2>1.)discard;vec3 n=vec3(vUV,sqrt(1.-r2));vec3 L=normalize(vec3(-.45,.7,.55));vec3 V=vec3(0.,0.,1.);float ndl=max(dot(n,L),0.);\n' +
    'vec3 H=normalize(L+V);float fres=pow(1.-n.z,2.4);\n' +
    'if(k<.5){ float spec=pow(max(dot(n,H),0.),120.);float spec2=pow(max(dot(n,normalize(vec3(.55,-.6,.6)+V)),0.),36.)*.32;\n' +
    '  vec3 base=mix(IC*.16,CY*.5,n.y*.5+.5)*(.35+.65*ndl);float edge=fres;\n' +
    '  vec3 c=base+IC*edge*.95+CY*spec2+vec3(spec)*.95;float a=vCol.a*(.14+.62*edge)+spec*.9*vCol.a+spec2*.2*vCol.a;\n' +
    '  c=mix(c,vCol.rgb*c,.0);c*=vCol.a; o=vec4(c,clamp(a,0.,1.));return;}\n' +
    'vec3 R=reflect(-V,n);float up=smoothstep(-.35,.85,R.y);float band=smoothstep(.0,.06,abs(R.y-.12))*.0+exp(-pow((R.y+.05)/.09,2.))*.5;\n' +
    'vec3 env=mix(vec3(.04,.055,.08),vec3(.78,.88,.95),up)+band*IC;float spec=pow(max(dot(n,H),0.),70.);\n' +
    'vec3 c=env*(.42+.5*ndl)*vec3(.92,.97,1.)+IC*fres*.5+vec3(spec)*.9;c=mix(c,c*vec3(.75,.95,1.05),.35);o=vec4(c*vCol.a,vCol.a);}';
  var VS_BOND = '#version 300 es\nlayout(location=0) in vec2 aC;layout(location=1) in vec4 iA;layout(location=2) in vec4 iB;layout(location=3) in vec4 iCol;uniform mat4 uV,uP;out vec2 vC;out vec4 vCol;out float vG;void main(){vec4 a=uV*vec4(iA.xyz,1.);vec4 b=uV*vec4(iB.xyz,1.);vec3 p=mix(a.xyz,b.xyz,aC.x);vec2 d=b.xy-a.xy;float l=length(d);d=l>1e-5?d/l:vec2(1.,0.);vec2 pe=vec2(-d.y,d.x);p.xy+=pe*aC.y*iA.w+d*(aC.x*2.-1.)*iA.w*.0;vC=aC;vCol=iCol;vG=iB.w;gl_Position=uP*vec4(p,1.);}';
  var FS_BOND = '#version 300 es\nprecision highp float;in vec2 vC;in vec4 vCol;in float vG;out vec4 o;void main(){float sh=sqrt(max(1.-vC.y*vC.y,0.));vec3 c=vCol.rgb*(.35+.65*sh)+vec3(.388,.867,.961)*vG*(.6+.4*sh);float a=vCol.a*(.5+.5*sh)+vG*.55*sh;a=clamp(a,0.,1.);o=vec4(c*a,a);}';
  var VS_BG = '#version 300 es\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}';
  var FS_BG = '#version 300 es\nprecision highp float;uniform vec2 uRes;uniform float uGlow,uPulse,uA,uT;out vec4 o;float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}\n' +
    'void main(){vec2 uv=gl_FragCoord.xy/uRes;vec2 p=(uv-.5)*vec2(uRes.x/uRes.y,1.);float d=length(p);vec3 bg=vec3(.031,.043,.063);\n' +
    'vec3 col=bg+vec3(.388,.867,.961)*(.075*exp(-d*d*5.5)*uGlow+.05*uPulse*exp(-d*d*9.))+vec3(.1,.16,.2)*.05*exp(-pow(d-.28,2.)*40.)*uGlow;\n' +
    'col*=1.-smoothstep(.45,1.05,d)*.55;col+=(h(gl_FragCoord.xy+uT)-.5)*.012;o=vec4(col*uA,uA);}';

  function compile(gl, type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  function program(gl, vs, fs) { var p = gl.createProgram(); gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; }
  function persp(f, a, n, fa) { var t = 1 / Math.tan(f / 2); return new Float32Array([t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (fa + n) / (n - fa), -1, 0, 0, 2 * fa * n / (n - fa), 0]); }
  function viewM(z, yaw) { var c = Math.cos(yaw), s = Math.sin(yaw); // translate(0,0,-z) * rotY(yaw)
    return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, -z, 1]); }

  /* ---------- the entrance ---------- */
  function play(opt) {
    opt = opt || {};
    var D = opt.duration || 2.5, doc = document, host = opt.host || doc.body;
    var logo = Object.assign({}, DEFAULT_LOGO, opt.logo || {});
    var reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var targets = [];
    (opt.reveal || []).forEach(function (s) { if (typeof s === 'string') [].forEach.call(doc.querySelectorAll(s), function (e) { targets.push(e); }); else if (s) targets.push(s); });
    var cover = doc.getElementById('he-cover');
    var ctl = { timing: { t0: performance.now(), clockStart: 0, end: 0, ticks: [] }, destroy: destroy, seek: function () { }, skip: function () { }, timeline: null, done: false, stats: { frames: 0, updateMs: 0, maxUpdateMs: 0 } };
    var finished = false;

    function finish() {
      if (finished) return; finished = true; ctl.done = true;
      try { targets.forEach(function (e) { e.style.opacity = ''; e.style.transform = ''; }); } catch (e) { }
      destroy(); if (opt.onDone) opt.onDone();
    }
    if (!root.gsap) { if (cover) cover.remove(); return (finish(), ctl); }
    if (reduce) { // no animation at all: the dashboard is simply there
      if (cover) cover.remove(); return (finish(), ctl);
    }

    var canvas, gl, rootEl, logoEl, tl, ro, raf = 0, W = 0, H = 0, dpr = 1, pxPerUnit = 1, destroyed = false;
    try {
      var small = Math.min(root.innerWidth, root.innerHeight) < 700;
      var N = opt.molecules || (small ? 36 : 64), NL = small ? 300 : 460;
      var rng = mulberry(opt.seed || 20251105);
      var scene = buildScene(rng, N, NL, logo.path, logo.viewBox);

      rootEl = doc.createElement('div'); rootEl.id = 'he-root'; rootEl.setAttribute('aria-hidden', 'true');
      rootEl.style.cssText = 'position:fixed;inset:0;z-index:2147483000;pointer-events:auto;touch-action:none;';
      canvas = doc.createElement('canvas'); canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
      rootEl.appendChild(canvas);
      logoEl = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
      logoEl.setAttribute('viewBox', logo.viewBox.join(' ')); logoEl.style.cssText = 'position:absolute;left:50%;top:50%;opacity:0;transform-origin:50% 50%;will-change:transform,opacity;';
      var lp = doc.createElementNS('http://www.w3.org/2000/svg', 'path'); lp.setAttribute('d', logo.path); lp.setAttribute('fill', logo.fill); lp.setAttribute('fill-rule', logo.fillRule); logoEl.appendChild(lp);
      rootEl.appendChild(logoEl); host.appendChild(rootEl);

      gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true, powerPreference: 'high-performance' });
      if (!gl) throw new Error('no webgl2');
      var pS = program(gl, VS_SPHERE, FS_SPHERE), pB = program(gl, VS_BOND, FS_BOND), pG = program(gl, VS_BG, FS_BG);
      var quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var bq = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bq); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, -1, 1, -1, 0, 1, 1, 1]), gl.STATIC_DRAW);
      var MAXS = 1700, MAXB = 420;
      function mkVAO(prog, qb, bufs) {
        var vao = gl.createVertexArray(); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, qb); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        bufs.forEach(function (b, i) { gl.bindBuffer(gl.ARRAY_BUFFER, b.buf); gl.enableVertexAttribArray(i + 1); gl.vertexAttribPointer(i + 1, b.n, gl.FLOAT, false, 0, 0); gl.vertexAttribDivisor(i + 1, 1); });
        gl.bindVertexArray(null); return vao;
      }
      function dyn(n) { var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, n * 4, gl.DYNAMIC_DRAW); return b; }
      var sbP = dyn(MAXS * 4), sbC = dyn(MAXS * 4), sbK = dyn(MAXS * 2), vaoS = mkVAO(pS, quad, [{ buf: sbP, n: 4 }, { buf: sbC, n: 4 }, { buf: sbK, n: 2 }]);
      var bbA = dyn(MAXB * 4), bbB = dyn(MAXB * 4), bbC = dyn(MAXB * 4), vaoB = mkVAO(pB, bq, [{ buf: bbA, n: 4 }, { buf: bbB, n: 4 }, { buf: bbC, n: 4 }]);
      var arrP = new Float32Array(MAXS * 4), arrC = new Float32Array(MAXS * 4), arrK = new Float32Array(MAXS * 2);
      var arrA = new Float32Array(MAXB * 4), arrB = new Float32Array(MAXB * 4), arrBC = new Float32Array(MAXB * 4);
      var uS = { V: gl.getUniformLocation(pS, 'uV'), P: gl.getUniformLocation(pS, 'uP') }, uB = { V: gl.getUniformLocation(pB, 'uV'), P: gl.getUniformLocation(pB, 'uP') };
      var uG = { res: gl.getUniformLocation(pG, 'uRes'), glow: gl.getUniformLocation(pG, 'uGlow'), pulse: gl.getUniformLocation(pG, 'uPulse'), a: gl.getUniformLocation(pG, 'uA'), t: gl.getUniformLocation(pG, 'uT') };
      var vaoG = gl.createVertexArray();
    } catch (err) {
      try { console.warn('[HydraEntrance] falling back to no animation:', err && err.message); } catch (e) { }
      if (cover) cover.remove(); destroy(); return (finish(), ctl);
    }

    var state = { bgA: 1 }, FOV = 35 * Math.PI / 180, ZF = 9.4, ZN = 11.6, LW = 1.5, pointer = { x: 0, y: 0 };
    var order = new Array(MAXS), depth = new Float32Array(MAXS), allP = new Float32Array(MAXS * 4), allC = new Float32Array(MAXS * 4), allK = new Float32Array(MAXS * 2);
    function byDepth(a, b) { return depth[a] - depth[b]; }

    function resize() {
      dpr = Math.min(root.devicePixelRatio || 1, 2, Math.sqrt(8.3e6 / (rootEl.clientWidth * rootEl.clientHeight))); // sharp on 4K, capped near 8 megapixels
      W = Math.max(2, Math.round(rootEl.clientWidth * dpr)); H = Math.max(2, Math.round(rootEl.clientHeight * dpr));
      canvas.width = W; canvas.height = H;
      var worldH = 2 * ZF * Math.tan(FOV / 2); pxPerUnit = rootEl.clientHeight / worldH;
      var lw = LW * pxPerUnit; logoEl.style.width = lw + 'px'; logoEl.style.height = lw + 'px'; logoEl.style.marginLeft = -lw / 2 + 'px'; logoEl.style.marginTop = -lw / 2 + 'px';
    }

    var tmpW = [0, 0, 0];
    function waterPos(m, t) {
      var s0 = easeOut(clamp(t / 0.8, 0, 1)), f = m.fq, p = m.ph;
      var bx = lerp(m.far[0], m.mid[0], s0), by = lerp(m.far[1], m.mid[1], s0), bz = lerp(m.far[2], m.mid[2], s0);
      var amp = 0.34 * (1 - sm(0.6, 1.5, t)) + 0.05;
      bx += Math.sin(t * f[0] * 3.1 + p[0]) * amp * 2; by += Math.sin(t * f[1] * 3.1 + p[1]) * amp * 2; bz += Math.sin(t * f[2] * 3.1 + p[2]) * amp * 2;
      var s = easeArrive(clamp((t - 0.6 - m.d) / 0.88, 0, 1)), s_ = s;
      // swirl: rotate the approach path around the cluster axis, unwinding as the molecule settles
      var ang = (1 - s) * (1 - s) * m.swirl * 1.5, ca = Math.cos(ang), sa = Math.sin(ang), x = bx * ca + bz * sa, z = -bx * sa + bz * ca;
      var px = lerp(x, m.target[0], s_), py = lerp(by, m.target[1], s_), pz = lerp(z, m.target[2], s_);
      // slow collective turn of the shell once the structure forms, tiny breathing
      var turn = 0.22 * sm(0.9, 1.9, t) * (t - 0.9), ct = Math.cos(turn * s), st = Math.sin(turn * s), qx = px * ct + pz * st, qz = -px * st + pz * ct;
      var br = 1 + 0.018 * Math.sin(t * 6.2 + m.ph[0]) * s;
      tmpW[0] = qx * br; tmpW[1] = py * br; tmpW[2] = qz * br; return s;
    }
    function waterQuat(m, t, s) { var spin = qMul(qAxis(m.ax, m.om * t), m.q0); return qSlerp(spin, m.qT, easeInOut(clamp(s * 1.12, 0, 1))); }

    var ringIdx;
    function draw() {
      if (destroyed) return;
      var t0 = performance.now(), t = clamp(tl ? tl.time() : 0, 0, D);
      var nS = 0, nB = 0, nAdd = 0, i, k, m;
      var yaw = -0.12 * (1 - easeInOut(clamp(t / 2.05, 0, 1))) + pointer.x * 0.05 * (1 - sm(1.8, 2.2, t));
      var cz = lerp(ZN, ZF, easeInOut(clamp(t / 2.05, 0, 1)));
      var V = viewM(cz, yaw), P = persp(FOV, W / H, 0.5, 60);
      var cyan = COL.cyan, ice = COL.ice;
      function sViewZ(x, y, z) { return V[2] * x + V[6] * y + V[10] * z + V[14]; }

      // timeline numbers
      var glow = sm(0, 0.5, t) * (1 - 0.35 * sm(1.9, 2.5, t)), pulseB = Math.exp(-Math.pow((t - 1.72) / 0.16, 2)) + 0.5 * Math.exp(-Math.pow((t - 1.3) / 0.12, 2));
      var contract = easeInOut(clamp((t - 1.78) / 0.42, 0, 1)), clusterFade = 1 - sm(1.9, 2.22, t);
      var pulseScale = 1 + 0.055 * Math.exp(-Math.pow((t - 1.3) / 0.1, 2)) + 0.09 * Math.exp(-Math.pow((t - 1.72) / 0.1, 2));
      var rot = 0.38 * t, cr = Math.cos(rot), sr = Math.sin(rot);

      // central structure
      var cpos = scene.atoms.map(function (a) {
        var x = a.p[0] * cr + a.p[2] * sr, z = -a.p[0] * sr + a.p[2] * cr, y = a.p[1], sc = pulseScale * (1 - 0.9 * contract);
        return [x * sc, y * sc, z * sc];
      });
      scene.atoms.forEach(function (a, ai) {
        var e = easeOut(clamp((t - 0.05 - a.delay) / 0.4, 0, 1)); if (e <= 0.001 || clusterFade <= 0.001) return;
        var al = e * clusterFade, c = cpos[ai], r = a.r * (0.3 + 0.7 * e) * (1 - 0.55 * contract) * (a.h ? 1 : 1);
        arrP[nS * 4] = c[0]; arrP[nS * 4 + 1] = c[1]; arrP[nS * 4 + 2] = c[2]; arrP[nS * 4 + 3] = r;
        arrC[nS * 4] = a.h ? 0.82 : 0.72; arrC[nS * 4 + 1] = a.h ? 0.9 : 0.8; arrC[nS * 4 + 2] = 0.94; arrC[nS * 4 + 3] = al;
        arrK[nS * 2] = 1; arrK[nS * 2 + 1] = 0; nS++;
      });
      scene.bonds.forEach(function (bd) {
        var a0 = scene.atoms[bd[0]], a1 = scene.atoms[bd[1]], e = Math.min(easeOut(clamp((t - 0.05 - a0.delay) / 0.4, 0, 1)), easeOut(clamp((t - 0.05 - a1.delay) / 0.4, 0, 1)));
        if (e <= 0.18 || clusterFade <= 0.001 || nB >= MAXB) return;
        var A = cpos[bd[0]], B = cpos[bd[1]], g = 0.25 * pulseB + 0.1 * sm(0.3, 0.7, t) * (1 - sm(0.9, 1.4, t));
        arrA[nB * 4] = A[0]; arrA[nB * 4 + 1] = A[1]; arrA[nB * 4 + 2] = A[2]; arrA[nB * 4 + 3] = 0.055 * (1 - 0.5 * contract);
        arrB[nB * 4] = A[0] + (B[0] - A[0]) * e; arrB[nB * 4 + 1] = A[1] + (B[1] - A[1]) * e; arrB[nB * 4 + 2] = A[2] + (B[2] - A[2]) * e; arrB[nB * 4 + 3] = g;
        arrBC[nB * 4] = 0.7; arrBC[nB * 4 + 1] = 0.82; arrBC[nB * 4 + 2] = 0.9; arrBC[nB * 4 + 3] = 0.85 * clusterFade * sm(0.18, 0.7, e); nB++;
      });

      // water
      var wpos = new Array(scene.water.length), LH = 0.4, HA = 52.25 * Math.PI / 180, lx = Math.sin(HA) * LH, ly = Math.cos(HA) * LH, arrived = new Float32Array(scene.water.length);
      var addP = [],
          dustCount = 0;
      var addArr = []; // [x,y,z,r,cr,cg,cb,a]
      scene.water.forEach(function (m, wi) {
        var s = waterPos(m, t), pos = [tmpW[0], tmpW[1], tmpW[2]]; arrived[wi] = s;
        var u = clamp((t - 1.72 - m.off * 0.14) / 0.5, 0, 1), eu = easeOut(u), outN = norm(pos);
        // phase 3: displaced outward and dissolving into fine particles
        pos = [pos[0] + outN[0] * 1.9 * eu, pos[1] + outN[1] * 1.9 * eu, pos[2] + outN[2] * 1.9 * eu];
        wpos[wi] = pos;
        var inA = sm(0.12 + m.d * 0.5, 0.5 + m.d * 0.5, t), a = inA * (1 - sm(0.12, 0.8, u)), rs = 1 - 0.97 * easeInOut(u);
        if (a > 0.003 && rs > 0.02) {
          var q = waterQuat(m, t, s), O = pos, H1 = qRot(q, [lx, ly, 0]), H2 = qRot(q, [-lx, ly, 0]), lit = 0.55 + 0.45 * sm(0.6, 1.4, t);
          function put(p, r, ha) {
            arrP[nS * 4] = p[0]; arrP[nS * 4 + 1] = p[1]; arrP[nS * 4 + 2] = p[2]; arrP[nS * 4 + 3] = r * rs;
            arrC[nS * 4] = 1; arrC[nS * 4 + 1] = 1; arrC[nS * 4 + 2] = 1; arrC[nS * 4 + 3] = a * ha; arrK[nS * 2] = 0; arrK[nS * 2 + 1] = 0; nS++;
          }
          put(O, 0.19, 1);
          var h1 = [O[0] + H1[0] * rs, O[1] + H1[1] * rs, O[2] + H1[2] * rs], h2 = [O[0] + H2[0] * rs, O[1] + H2[1] * rs, O[2] + H2[2] * rs];
          put(h1, 0.105, lit); put(h2, 0.105, lit);
          if (nB + 2 < MAXB) {
            [h1, h2].forEach(function (h) {
              arrA[nB * 4] = O[0]; arrA[nB * 4 + 1] = O[1]; arrA[nB * 4 + 2] = O[2]; arrA[nB * 4 + 3] = 0.03 * rs;
              arrB[nB * 4] = h[0]; arrB[nB * 4 + 1] = h[1]; arrB[nB * 4 + 2] = h[2]; arrB[nB * 4 + 3] = 0.15 * Math.exp(-Math.pow((t - 0.6 - m.d - 0.5) / 0.3, 2));
              arrBC[nB * 4] = 0.66; arrBC[nB * 4 + 1] = 0.9; arrBC[nB * 4 + 2] = 0.96; arrBC[nB * 4 + 3] = 0.5 * a; nB++;
            });
          }
          // fine trails behind fast molecules (phase 1 and 2)
          if (t < 1.65) {
            var sp = 0.06; [1, 2].forEach(function (k2) {
              var tt = t - sp * k2, s2 = waterPos(m, tt), pp = [tmpW[0], tmpW[1], tmpW[2]], vv = Math.hypot(pp[0] - O[0], pp[1] - O[1], pp[2] - O[2]);
              var ta = clamp(vv * 1.4, 0, 1) * inA * (k2 === 1 ? 0.18 : 0.09);
              if (ta > 0.004) addArr.push([pp[0], pp[1], pp[2], 0.07 * (1 - k2 * 0.25), cyan[0], cyan[1], cyan[2], ta]);
            });
          }
        }
        // fine luminous particles
        if (u > 0.001 && u < 0.999) {
          for (k = 0; k < 3; k++) {
            var sp2 = m.spawn[k], dd = 0.25 + k * 0.35, pe = [pos[0] + sp2[0] * 0.18, pos[1] + sp2[1] * 0.18, pos[2] + sp2[2] * 0.18];
            var oN = norm(pe), travel = easeOut(u) * (1.2 + k * 0.9);
            addArr.push([pe[0] + oN[0] * travel, pe[1] + oN[1] * travel, pe[2] + oN[2] * travel, 0.05 + 0.02 * k, ice[0], ice[1], ice[2], sm(0, 0.18, u) * (1 - sm(0.45, 1, u)) * 0.85]);
          }
        }
      });
      // hydrogen bond network flashes while the shell forms
      scene.hb.forEach(function (pr) {
        if (nB >= MAXB) return; var A = scene.water[pr[0]], B = scene.water[pr[1]];
        var arr = (arrived[pr[0]] + arrived[pr[1]]) / 2, tA = 0.6 + (A.d + B.d) / 2 + 0.55, g = Math.exp(-Math.pow((t - tA - 0.12) / 0.2, 2)) * 0.9 * (1 - sm(1.72, 1.95, t));
        var vis = clamp(arr * 1.2, 0, 1) * (1 - sm(1.72, 1.95, t)); if (vis < 0.05) return;
        var p0 = wpos[pr[0]], p1 = wpos[pr[1]];
        arrA[nB * 4] = p0[0]; arrA[nB * 4 + 1] = p0[1]; arrA[nB * 4 + 2] = p0[2]; arrA[nB * 4 + 3] = 0.012 + 0.02 * g;
        arrB[nB * 4] = p1[0]; arrB[nB * 4 + 1] = p1[1]; arrB[nB * 4 + 2] = p1[2]; arrB[nB * 4 + 3] = g;
        arrBC[nB * 4] = 0.55; arrBC[nB * 4 + 1] = 0.85; arrBC[nB * 4 + 2] = 0.95; arrBC[nB * 4 + 3] = 0.16 * vis + 0.6 * g * vis; nB++;
      });

      // logo made of light, assembled from the dissolving particles
      var lp = scene.logo, nl = lp.length;
      for (i = 0; i < nl; i++) {
        var tx = lp[i][0] * LW, ty = lp[i][1] * LW, src = wpos[i % wpos.length], jr = ((i * 7919) % 100) / 100, st = 1.78 + jr * 0.2, uu = easeInOut(clamp((t - st) / 0.5, 0, 1));
        if (uu <= 0) continue;
        var sx = src[0], sy = src[1], sz = src[2], cx2 = sx * 1.35 + (jr - 0.5) * 1.2, cy2 = sy * 1.35 + (((i * 31) % 100) / 100 - 0.5) * 1.2, cz2 = sz * 1.2;
        var o2 = 1 - uu, bx = o2 * o2 * sx + 2 * o2 * uu * cx2 + uu * uu * tx, by = o2 * o2 * sy + 2 * o2 * uu * cy2 + uu * uu * ty, bz = o2 * o2 * sz + 2 * o2 * uu * cz2;
        var a2 = sm(0, 0.25, uu) * (1 - sm(2.2, 2.42, t)) * 0.95;
        if (a2 > 0.004) addArr.push([bx, by, bz, 0.018 + 0.011 * (1 - uu) + 0.008 * jr, lerp(ice[0], cyan[0], jr), lerp(ice[1], cyan[1], jr), lerp(ice[2], cyan[2], jr), a2]);
      }
      // two pulses from the structure
      var rings = [[1.28, 0.55, 0.45, 1.5], [1.7, 0.75, 0.9, 2.2]];
      rings.forEach(function (rg) { var u2 = (t - rg[0]) / rg[1]; if (u2 > 0 && u2 < 1) addArr.push([0, 0, 0, rg[3] * (0.35 + 0.65 * easeOut(u2)), 0, 0, 0, rg[2] * 0.85, easeOut(u2)]); });

      // sort glass spheres back to front
      for (i = 0; i < nS; i++) { order[i] = i; var vz = sViewZ(arrP[i * 4], arrP[i * 4 + 1], arrP[i * 4 + 2]); depth[i] = vz;
        var dn = clamp((-vz - (cz - 2.6)) / 5.2, 0, 1); if (arrK[i * 2] < 0.5) { arrC[i * 4 + 3] *= 1 - 0.58 * dn; arrP[i * 4 + 3] *= 1 - 0.12 * dn; } else { arrC[i * 4 + 3] *= 1 - 0.3 * dn; } }
      order.length = nS; var ord = order.sort(byDepth); order.length = MAXS;
      var nSphere = nS, base = nSphere, addCount = Math.min(addArr.length, MAXS - nSphere - 4);
      for (i = 0; i < nSphere; i++) { var o = ord[i]; allP[i * 4] = arrP[o * 4]; allP[i * 4 + 1] = arrP[o * 4 + 1]; allP[i * 4 + 2] = arrP[o * 4 + 2]; allP[i * 4 + 3] = arrP[o * 4 + 3];
        allC[i * 4] = arrC[o * 4]; allC[i * 4 + 1] = arrC[o * 4 + 1]; allC[i * 4 + 2] = arrC[o * 4 + 2]; allC[i * 4 + 3] = arrC[o * 4 + 3]; allK[i * 2] = arrK[o * 2]; allK[i * 2 + 1] = arrK[o * 2 + 1]; }
      for (i = 0; i < addCount; i++) {
        var ad = addArr[i], q2 = base + i;
        allP[q2 * 4] = ad[0]; allP[q2 * 4 + 1] = ad[1]; allP[q2 * 4 + 2] = ad[2]; allP[q2 * 4 + 3] = ad[3];
        allC[q2 * 4] = ad[4]; allC[q2 * 4 + 1] = ad[5]; allC[q2 * 4 + 2] = ad[6]; allC[q2 * 4 + 3] = ad[7];
        allK[q2 * 2] = ad.length > 8 ? 3 : 2; allK[q2 * 2 + 1] = ad.length > 8 ? ad[8] : 0;
      }

      var upd = performance.now() - t0;
      // ----- GPU -----
      gl.viewport(0, 0, W, H); gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(pG); gl.uniform2f(uG.res, W, H); gl.uniform1f(uG.glow, glow); gl.uniform1f(uG.pulse, pulseB); gl.uniform1f(uG.a, clamp(state.bgA, 0, 1)); gl.uniform1f(uG.t, t);
      gl.bindVertexArray(vaoG); gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (nB) {
        gl.useProgram(pB); gl.uniformMatrix4fv(uB.V, false, V); gl.uniformMatrix4fv(uB.P, false, P);
        gl.bindBuffer(gl.ARRAY_BUFFER, bbA); gl.bufferSubData(gl.ARRAY_BUFFER, 0, arrA, 0, nB * 4); gl.bindBuffer(gl.ARRAY_BUFFER, bbB); gl.bufferSubData(gl.ARRAY_BUFFER, 0, arrB, 0, nB * 4); gl.bindBuffer(gl.ARRAY_BUFFER, bbC); gl.bufferSubData(gl.ARRAY_BUFFER, 0, arrBC, 0, nB * 4);
        gl.bindVertexArray(vaoB); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, nB);
      }
      var total = nSphere + addCount;
      if (total) {
        gl.useProgram(pS); gl.uniformMatrix4fv(uS.V, false, V); gl.uniformMatrix4fv(uS.P, false, P);
        gl.bindBuffer(gl.ARRAY_BUFFER, sbP); gl.bufferSubData(gl.ARRAY_BUFFER, 0, allP, 0, total * 4); gl.bindBuffer(gl.ARRAY_BUFFER, sbC); gl.bufferSubData(gl.ARRAY_BUFFER, 0, allC, 0, total * 4); gl.bindBuffer(gl.ARRAY_BUFFER, sbK); gl.bufferSubData(gl.ARRAY_BUFFER, 0, allK, 0, total * 2);
        gl.bindVertexArray(vaoS); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, total);
      }
      ctl.stats.frames++; ctl.stats.updateMs += upd; ctl.stats.maxUpdateMs = Math.max(ctl.stats.maxUpdateMs, upd);
    }

    // ----- GSAP master timeline -----
    resize();
    tl = root.gsap.timeline({ paused: true, onUpdate: draw, defaults: { overwrite: false } });
    var ticker = { t: 0 }; tl.to(ticker, { t: D, duration: D, ease: 'none' }, 0);
    tl.set(rootEl, { pointerEvents: 'none' }, 1.7);
    tl.to(state, { bgA: 0, duration: 0.6, ease: 'power2.inOut' }, 1.85);
    if (targets.length) {
      root.gsap.set(targets, { opacity: 0, y: 10 });
      tl.to(targets, { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out', stagger: 0.05, clearProps: 'opacity,transform' }, 1.9);
    }
    // the logo made of light becomes the real logo, then docks where the dashboard keeps it
    var tgt = opt.logoTarget ? doc.querySelector(opt.logoTarget) : null;
    tl.to(logoEl, { opacity: 1, duration: 0.2, ease: 'power1.out' }, 2.1);
    if (tgt) {
      var dock = function () {
        var r = tgt.getBoundingClientRect(), lw = LW * pxPerUnit, vw = rootEl.clientWidth, vh = rootEl.clientHeight;
        return { x: r.left + r.width / 2 - vw / 2, y: r.top + r.height / 2 - vh / 2, s: Math.max(0.05, Math.min(r.width, r.height) / lw) };
      };
      tl.to(logoEl, { x: function () { return dock().x; }, y: function () { return dock().y; }, scale: function () { return dock().s; }, duration: 0.34, ease: 'power3.inOut' }, 2.14);
      tl.to(logoEl, { opacity: 0, duration: 0.14, ease: 'power1.in' }, D - 0.14);
    } else {
      tl.to(logoEl, { opacity: 0, duration: 0.22, ease: 'power1.in' }, D - 0.22);
    }

    // skipping: any key or click fast forwards the same choreography (no hard cut)
    var speed = 1; function skip() { speed = 5; }
    rootEl.addEventListener('pointerdown', skip); doc.addEventListener('keydown', skip, { once: false });
    function onMove(e) { pointer.x = (e.clientX / root.innerWidth - 0.5) * 2; pointer.y = (e.clientY / root.innerHeight - 0.5) * 2; }
    if (!opt.paused) root.addEventListener('pointermove', onMove, { passive: true });
    ro = root.ResizeObserver ? new root.ResizeObserver(function () { resize(); if (tl && tl.paused()) draw(); }) : null; if (ro) ro.observe(rootEl);
    ctl.timeline = tl; ctl.skip = skip; ctl.seek = function (t) { tl.pause(); tl.time(t, false); draw(); };
    draw(); // first frame is drawn before the cover goes away: no flash
    if (cover) { cover.remove(); }
    if (!opt.paused) { // wall clock: always D real seconds (frames are skipped on a slow machine, GSAP lag smoothing is not used)
      var clock = 0, last = -1; ctl.timing.clockStart = performance.now();
      (function tick() {
        if (destroyed || finished) return; var now = performance.now();
        if (last < 0) last = now; clock += Math.max(0, now - last) / 1000 * speed; last = now;
        if (ctl.timing.ticks.length < 400) ctl.timing.ticks.push([+(now).toFixed(0), +clock.toFixed(3)]);
        if (clock >= D) { tl.time(D); ctl.timing.end = performance.now(); finish(); return; }
        tl.time(clock); raf = root.requestAnimationFrame(tick);
      })();
    }

    function destroy() {
      if (destroyed) return; destroyed = true;
      try { if (raf) root.cancelAnimationFrame(raf); if (tl) tl.kill(); if (ro) ro.disconnect(); root.removeEventListener('pointermove', onMove); doc.removeEventListener('keydown', skip); } catch (e) { }
      try { if (gl) { var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); } } catch (e) { }
      try { if (rootEl && rootEl.parentNode) rootEl.parentNode.removeChild(rootEl); } catch (e) { }
      var c = doc.getElementById('he-cover'); if (c) c.remove();
    }
    return ctl;
  }

  root.HydraEntrance = { play: play, version: '1.0.0' };
})(typeof window !== 'undefined' ? window : this);
