/*!
 * Hydra entrance, marketing cut. Water beads on a dark, rough, water repelling surface (like a lab bench photo), the beads roll together and merge into one
 * liquid glass sphere, light sweeps across it, the wordmark reveals, and the scene dissolves into the dashboard. About 2.6 seconds, one continuous shot.
 * Raw WebGL2 (one raymarched fragment shader: liquid glass, refraction, a rough sparkling surface) plus a GSAP master timeline.
 * Appearance only: it never reads or changes dashboard data. There is NO default logo: pass one only if you have the real logo.
 *
 *   HydraEntrance.play({
 *     title: 'Hydra',                       // wordmark revealed under the sphere ('' for none)
 *     reveal: ['.topbar', '.sidebar', 'main'],
 *     logo: { path: 'M...', viewBox: [0,0,100,100], fill: '#63DDF5', fillRule: 'evenodd' },  // optional: the sphere morphs into it and docks
 *     logoTarget: '.topbar .logo',          // where that logo docks (optional)
 *     quality: 'auto' | 'low' | 'high',     // render pixel budget (auto about 2 megapixels and lowered further on slow devices, high about 8.3)
 *     duration: 2.6, paused: false, onDone: fn
 *   })  ->  controller { seek(t), skip(), destroy(), timeline, done, stats, timing }
 */
(function (root) {
  'use strict';
  var COLORS = { cyan: '#63DDF5' };

  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function bez(x1, y1, x2, y2) {
    function cx(t) { return 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t; }
    function cy(t) { return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t; }
    return function (x) { if (x <= 0) return 0; if (x >= 1) return 1; var lo = 0, hi = 1, t = x; for (var i = 0; i < 18; i++) { t = (lo + hi) / 2; if (cx(t) < x) lo = t; else hi = t; } return cy(t); };
  }
  var easeOut = bez(0.22, 1, 0.36, 1), easeInOut = bez(0.65, 0, 0.35, 1), easeSoft = bez(0.45, 0, 0.2, 1);
  function sm(a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }

  /* ---------- optional logo as a signed distance field (exact transform, smooth edges) ---------- */
  function edt1(f, n, d, v, z) {
    var k = 0, q, s; v[0] = 0; z[0] = -1e20; z[1] = 1e20;
    for (q = 1; q < n; q++) {
      s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = 1e20;
    }
    k = 0; for (q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
  }
  function edt2(grid, S) {
    var out = new Float64Array(S * S), f = new Float64Array(S), d = new Float64Array(S), v = new Int32Array(S), z = new Float64Array(S + 1), x, y;
    for (x = 0; x < S; x++) { for (y = 0; y < S; y++) f[y] = grid[y * S + x]; edt1(f, S, d, v, z); for (y = 0; y < S; y++) out[y * S + x] = d[y]; }
    for (y = 0; y < S; y++) { for (x = 0; x < S; x++) f[x] = out[y * S + x]; edt1(f, S, d, v, z); for (x = 0; x < S; x++) out[y * S + x] = d[x]; }
    return out;
  }
  function logoField(path, vb) {
    var S = 256, cv = document.createElement('canvas'); cv.width = cv.height = S;
    var cx = cv.getContext('2d'); cx.scale(S / vb[2], S / vb[3]); cx.translate(-vb[0], -vb[1]); cx.fillStyle = '#fff'; cx.fill(new Path2D(path), 'evenodd');
    var px = cx.getImageData(0, 0, S, S).data, INF = 1e12, gi = new Float64Array(S * S), go = new Float64Array(S * S), i;
    for (i = 0; i < S * S; i++) { var on = px[i * 4 + 3] > 127; gi[i] = on ? INF : 0; go[i] = on ? 0 : INF; }
    var dIn = edt2(gi, S), dOut = edt2(go, S), out = new Uint8Array(S * S), R = 0.3;
    for (i = 0; i < S * S; i++) { var sd = dOut[i] > 0 ? Math.sqrt(dOut[i]) - 0.5 : -(Math.sqrt(dIn[i]) - 0.5); out[i] = Math.round(clamp(0.5 + (sd / S) / (2 * R), 0, 1) * 255); }
    return { data: out, size: S, range: R };
  }

  /* ---------- shaders ---------- */
  var VS = '#version 300 es\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}';
  var FS = [
    '#version 300 es', 'precision highp float;', 'out vec4 o;',
    'uniform vec2 uRes;uniform float uT;uniform vec3 uCam;uniform float uTy;uniform vec4 uB[6];uniform vec4 uSm[36];uniform float uK;uniform float uMorph,uFloorA,uObjA,uBgA,uSpin,uHas,uBloom;',
    'uniform float uLogoW;uniform vec4 uSw;uniform sampler2D uLogo;uniform float uLogoR;uniform float uFlash;uniform float uFloorY;',
    'const vec3 CY=vec3(.388,.867,.961);const vec3 IC=vec3(.70,.90,.97);',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}',
    'float dBlob(vec3 p){float d=1e5;for(int i=0;i<6;i++){vec4 b=uB[i];if(b.w>0.){d=smin(d,length(p-b.xyz)-b.w,uK);}}return d;}',
    'float dLogo(vec3 p){vec3 q=p-vec3(uB[0].x,uB[0].y,uB[0].z);float c=cos(uSpin),s=sin(uSpin);q.xz=mat2(c,-s,s,c)*q.xz;vec2 e=abs(q.xy/uLogoW)-.5;float outside=length(max(e,0.))*uLogoW;',
    ' float d2=(texture(uLogo,vec2(q.x/uLogoW+.5,.5-q.y/uLogoW)).r-.5)*2.*uLogoR*uLogoW+outside;float rr=.05,hh=.1;vec2 w=vec2(d2+rr,abs(q.z)-hh+rr);return min(max(w.x,w.y),0.)+length(max(w,0.))-rr;}',
    'float map(vec3 p){float db=dBlob(p);if(uHas<.5||uMorph<.001)return db;return mix(db,dLogo(p),uMorph);}',
    'vec3 nrm(vec3 p){vec2 e=vec2(.0012,-.0012);return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));}',
    'float march(vec3 ro,vec3 rd,float tmax){float t=.0;for(int i=0;i<52;i++){float d=map(ro+rd*t);if(d<.0008)return t;t+=d*.85;if(t>tmax)break;}return -1.;}',
    'float rect(vec2 p,vec2 c,vec2 hs,float soft){vec2 q=abs(p-c)-hs;return 1.-smoothstep(0.,soft,max(q.x,q.y));}',
    // a bright, soft laboratory like environment: haze at the horizon, a big window softbox, a cyan brand strip and two travelling light sweeps
    'vec3 env(vec3 d){float az=atan(d.x,-d.z),el=asin(clamp(d.y,-1.,1.));vec3 c=mix(vec3(.10,.19,.30),vec3(.012,.028,.065),smoothstep(-.05,.85,d.y));',
    ' c+=vec3(.20,.36,.52)*exp(-pow(el-.04,2.)*30.)*.9;',
    ' c+=vec3(1.,1.02,1.05)*rect(vec2(az,el),vec2(.95,.52),vec2(.62,.2),.24)*2.4;',
    ' c+=vec3(.72,.86,1.)*rect(vec2(az,el),vec2(-1.25,.3),vec2(.34,.5),.28)*1.0;',
    ' c+=CY*rect(vec2(az,el),vec2(2.35,.12),vec2(.05,.6),.1)*1.1;',
    ' c+=vec3(1.)*uSw.y*exp(-pow((az-uSw.x)/.09,2.))*smoothstep(-.4,.2,el)*1.8;',
    ' c+=vec3(1.)*uSw.w*exp(-pow((az-uSw.z)/.09,2.))*smoothstep(-.4,.2,el)*1.8;return c;}',
    'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}',
    'vec3 bg(vec3 d){float az=atan(d.x,-d.z),el=asin(clamp(d.y,-1.,1.));vec3 c=mix(vec3(.04,.085,.15),vec3(.006,.016,.04),smoothstep(-.02,.45,d.y));c+=vec3(.10,.19,.30)*exp(-pow(el-.035,2.)*70.)*.75;',
    ' vec2 g=vec2(az*1.7,el*3.4)*1.4;vec2 id=floor(g),f=fract(g)-.5;float h=hash(id+5.);vec2 off=(vec2(hash(id+1.),hash(id+2.))-.5)*.5;float r=length(f-off);c+=vec3(.45,.68,.9)*smoothstep(.2+.1*h,.08,r)*step(.6,h)*.085*smoothstep(-.02,.25,el);return c;}',
    'vec3 floorBase(vec3 h){float r=length(h.xz);return vec3(.007,.012,.022)+vec3(.028,.058,.1)*exp(-r*r*.09);}',
    // clear liquid glass: refraction to the surface, inverted bright window inside, bright rim, luminous base where it touches the surface
    'vec3 shade(vec3 p,vec3 n,vec3 rd){float ndv=clamp(dot(n,-rd),0.,1.);float fr=pow(1.-ndv,3.);vec3 rf=env(reflect(rd,n));',
    ' vec3 rr=refract(rd,n,.77);vec3 thr;if(rr.y<-.001){float tt=(uFloorY-p.y)/rr.y;vec3 fh=p+rr*tt;thr=mix(env(rr),floorBase(fh)*2.6+CY*.05*exp(-dot(fh.xz,fh.xz)*.4),clamp(uFloorA,0.,1.));}else{thr=env(rr);}',
    ' float thick=pow(ndv,.8);vec3 tint=mix(vec3(.86,.95,1.),vec3(.40,.62,.86),thick*.7);vec3 col=thr*tint+rf*(.07+.93*fr);',
    ' float low=exp(-max(p.y-uFloorY,0.)*8.)*clamp(uFloorA,0.,1.);col+=IC*low*(.35+.65*(1.-ndv))*1.2;',
    ' col+=CY*pow(1.-ndv,4.)*.3*(.3+uMorph+uBloom);vec3 L=normalize(vec3(-.5,.8,.45));col+=vec3(1.)*pow(max(dot(n,normalize(L-rd)),0.),160.)*1.5;col+=IC*pow(max(dot(n,normalize(vec3(.6,-.4,.5)-rd)),0.),36.)*.22*thick;return col;}',
    'void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;vec3 ro=uCam;vec3 ta=vec3(0.,uTy,0.);vec3 fw=normalize(ta-ro),rt=normalize(cross(fw,vec3(0.,1.,0.))),up=cross(rt,fw);',
    ' vec3 rd=normalize(uv.x*rt+uv.y*up+fw*(1./tan(.28)));',
    ' float tb=march(ro,rd,18.);float tf=rd.y<-.0001?(uFloorY-ro.y)/rd.y:-1.;',
    // many small beads, hit analytically: spherical caps standing on the surface
    ' float ts=1e9;vec3 sp=vec3(0.),sn=vec3(0.,1.,0.);for(int i=0;i<36;i++){vec4 s=uSm[i];if(s.w>.002){vec3 oc=ro-s.xyz;float b=dot(oc,rd);float c=dot(oc,oc)-s.w*s.w;float hh=b*b-c;if(hh>0.){float t=-b-sqrt(hh);if(t>0.&&t<ts){vec3 p=ro+rd*t;if(p.y>uFloorY){ts=t;sp=p;sn=(p-s.xyz)/s.w;}}}}}',
    ' bool hitS=ts<1e8&&(tb<0.||ts<tb)&&(tf<0.||ts<tf);bool hitB=!hitS&&tb>0.&&(tf<0.||tb<tf);vec3 col;float alpha=uBgA;',
    ' if(hitS){col=shade(sp,sn,rd);alpha=max(uObjA,uBgA);}',
    ' else if(hitB){vec3 p=ro+rd*tb;col=shade(p,nrm(p),rd);alpha=max(uObjA,uBgA);}',
    ' else if(tf>0.){vec3 h=ro+rd*tf;float r=length(h.xz);vec3 fb=floorBase(h);',
    // a rough, grainy surface: a tiny random normal per grain
    '  vec2 gp=h.xz*72.;float gf=1./(1.+r*.32);float nx=vn(gp+vec2(.6,0.))-vn(gp-vec2(.6,0.));float nz=vn(gp+vec2(0.,.6))-vn(gp-vec2(0.,.6));vec3 nn=normalize(vec3(nx*.55*gf,1.,nz*.55*gf));float cosT=clamp(dot(-rd,nn),0.,1.);float F=mix(.04,.5,pow(1.-cosT,3.));',
    '  vec3 rdr=reflect(rd,nn);rdr.y=abs(rdr.y)+.015;float tr=r<3.4?march(h+vec3(0.,.002,0.),rdr,7.):-1.;vec3 refl;if(tr>0.){vec3 hp=h+rdr*tr;refl=shade(hp,nrm(hp),rdr);}else refl=env(rdr);',
    '  float ao=1.-.6*exp(-max(dBlob(h),0.)*5.);vec3 glow=vec3(0.);for(int i=0;i<36;i++){vec4 s=uSm[i];if(s.w>.002){float dd=max(length(h.xz-s.xz)-s.w*.8,0.);ao*=1.-.5*exp(-dd*15.);glow+=(IC*.5+CY*.15)*exp(-dd*26.)*.22;}}',
    '  float mR=uB[0].w;vec2 cc=vec2(uB[0].x+.4*mR,uB[0].z+.55*mR);float cd=length(h.xz-cc);vec3 cs=(CY*.5+IC*.3)*exp(-cd*cd/(max(mR*mR,.01)*1.5))*smoothstep(.3,.6,mR)*.8*(1.-uMorph);',
    '  col=fb*ao+refl*F*ao+glow*clamp(uFloorA,0.,1.)+cs;',
    // sparkle in the grain, brightest when a light sweep passes
    '  float sh=hash(floor(h.xz*130.));float spk=step(.987,sh)*(.3+.7*pow(abs(sin(uT*3.1+sh*50.)),6.));col+=IC*spk*(.35+uSw.y*1.8+uSw.w*1.8)*exp(-r*.22);',
    '  vec3 bgc=bg(rd);col=mix(col,bgc,1.-exp(-r*.09));col=mix(bgc,col,clamp(uFloorA,0.,1.));}',
    ' else{col=bg(rd);}',
    // soft out of focus motes drifting in the haze
    ' for(int k=0;k<2;k++){float sc=k==0?7.:13.;vec2 g=uv*sc+vec2(uT*(.05+.03*float(k)),-uT*.03);vec2 id=floor(g),f=fract(g)-.5;float h=hash(id+float(k)*17.);vec2 off=(vec2(hash(id+3.1),hash(id+7.7))-.5)*.6;float r=length(f-off);float mote=smoothstep(.08+.05*h,0.,r)*step(.8,h)*(.5+.5*sin(uT*1.4+h*40.));col+=IC*mote*.14*(k==0?1.:.6)*uBgA;}',
    ' col*=1.+uFlash*.45+uBloom*.5;col=col/(1.+col*.55)*1.35;col=pow(col,vec3(.9));float vg=1.-smoothstep(.5,1.2,length(uv));col*=mix(.6,1.,vg);col+=(hash(gl_FragCoord.xy+uT)-.5)*.014;',
    ' o=vec4(col*alpha,alpha);}'
  ].join('\n');
  function compile(gl, type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }

  /* ---------- the entrance ---------- */
  function play(opt) {
    opt = opt || {};
    var D = opt.duration || 2.6, doc = document, host = opt.host || doc.body;
    var logo = opt.logo ? Object.assign({ viewBox: [0, 0, 100, 100], fill: COLORS.cyan, fillRule: 'evenodd' }, opt.logo) : null;
    var title = opt.title === undefined ? 'Hydra' : opt.title;
    var reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var targets = [];
    (opt.reveal || []).forEach(function (s) { if (typeof s === 'string') [].forEach.call(doc.querySelectorAll(s), function (e) { targets.push(e); }); else if (s) targets.push(s); });
    var cover = doc.getElementById('he-cover');
    var ctl = { timing: { t0: performance.now(), clockStart: 0, end: 0 }, destroy: destroy, seek: function () { }, skip: function () { }, timeline: null, done: false, stats: { frames: 0, updateMs: 0, maxUpdateMs: 0 } };
    var finished = false, destroyed = false, raf = 0, tl, ro, rootEl, canvas, gl, logoEl = null, titleEl = null, speed = 1;

    function finish() { if (finished) return; finished = true; ctl.done = true; try { targets.forEach(function (e) { e.style.opacity = ''; e.style.transform = ''; }); } catch (e) { } destroy(); if (opt.onDone) opt.onDone(); }
    function destroy() {
      if (destroyed) return; destroyed = true;
      try { if (raf) root.cancelAnimationFrame(raf); if (tl) tl.kill(); if (ro) ro.disconnect(); doc.removeEventListener('keydown', skip); } catch (e) { }
      try { if (gl) { var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); } } catch (e) { }
      try { if (rootEl && rootEl.parentNode) rootEl.parentNode.removeChild(rootEl); } catch (e) { }
      var c = doc.getElementById('he-cover'); if (c) c.remove();
    }
    function skip() { speed = 5; }
    if (!root.gsap || reduce) { if (cover) cover.remove(); return (finish(), ctl); }

    var U = {}, prog, vao, W = 1, H = 1, pxPerUnit = 1, LW = 0.82, FY = -0.82, KD = 0.6, FINAL_Z = 6.3, RF = 0.4;
    var small = Math.min(root.innerWidth, root.innerHeight) < 700, rng = mulberry(opt.seed || 7771), i;
    var beads = new Float32Array(24), smalls = new Float32Array(144), NM = 3, NS = small ? 18 : 30, med = [], sml = [];
    for (i = 0; i < NM; i++) { var am = rng() * 6.283, rm = 1.0 + rng() * 1.0; med.push({ x: Math.cos(am) * rm * 1.2, z: Math.sin(am) * rm * 0.55 - 0.15, r: 0.13 + rng() * 0.07, d: rng() * 0.2, bow: (rng() - 0.5) * 0.8, born: 0.04 + rng() * 0.2 }); }
    for (i = 0; i < NS; i++) {
      var as = rng() * 6.283, rs = 0.8 + Math.pow(rng(), 0.75) * 3.4, rad = 0.022 + 0.085 * Math.pow(rng(), 2.3);
      sml.push({ x: Math.cos(as) * rs * 1.45, z: Math.sin(as) * rs * 0.62 - 0.2, r: rad, d: rng() * 0.38, bow: (rng() - 0.5) * 1.2, born: rng() * 0.45, hold: rng() < 0.35 });
    }

    try {
      rootEl = doc.createElement('div'); rootEl.id = 'he-root'; rootEl.setAttribute('aria-hidden', 'true');
      rootEl.style.cssText = 'position:fixed;inset:0;z-index:2147483000;pointer-events:auto;touch-action:none;';
      canvas = doc.createElement('canvas'); canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; rootEl.appendChild(canvas);
      if (logo) {
        logoEl = doc.createElementNS('http://www.w3.org/2000/svg', 'svg'); logoEl.setAttribute('viewBox', logo.viewBox.join(' ')); logoEl.style.cssText = 'position:absolute;left:50%;top:50%;opacity:0;transform-origin:50% 50%;will-change:transform,opacity;';
        var lp = doc.createElementNS('http://www.w3.org/2000/svg', 'path'); lp.setAttribute('d', logo.path); lp.setAttribute('fill', logo.fill); lp.setAttribute('fill-rule', logo.fillRule); logoEl.appendChild(lp); rootEl.appendChild(logoEl);
      }
      if (title) {
        titleEl = doc.createElement('div'); titleEl.style.cssText = 'position:absolute;left:0;right:0;top:50%;text-align:center;color:#EAF4FF;font:300 clamp(26px,3.4vw,56px)/1 "Segoe UI Variable Display","Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;letter-spacing:.55em;padding-left:.55em;pointer-events:none;text-shadow:0 2px 30px rgba(8,30,60,.55),0 0 24px rgba(99,221,245,.3);white-space:nowrap;';
        title.split('').forEach(function (ch) { var w = doc.createElement('span'); w.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding:.12em 0;'; var s = doc.createElement('span'); s.textContent = ch; s.style.cssText = 'display:inline-block;will-change:transform,opacity,filter;'; w.appendChild(s); titleEl.appendChild(w); });
        rootEl.appendChild(titleEl);
      }
      host.appendChild(rootEl);
      gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'high-performance' });
      if (!gl) throw new Error('no webgl2');
      prog = gl.createProgram(); gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS)); gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      ['uRes', 'uT', 'uCam', 'uTy', 'uB', 'uSm', 'uK', 'uMorph', 'uFloorA', 'uObjA', 'uBgA', 'uSpin', 'uHas', 'uBloom', 'uLogoW', 'uSw', 'uLogo', 'uLogoR', 'uFlash', 'uFloorY'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
      var f = logo ? logoField(logo.path, logo.viewBox) : { data: new Uint8Array([255]), size: 1, range: 0.3 }, tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, f.size, f.size, 0, gl.RED, gl.UNSIGNED_BYTE, f.data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      U.range = f.range; vao = gl.createVertexArray();
    } catch (err) {
      try { console.warn('[HydraEntrance] falling back to no animation:', err && err.message); } catch (e) { }
      if (cover) cover.remove(); destroy(); return (finish(), ctl);
    }

    var state = { bgA: 1, objA: 1 }, qScale = 1;
    function resize() {
      var cw = rootEl.clientWidth, ch = rootEl.clientHeight, dpr = root.devicePixelRatio || 1;
      var budget = (opt.quality === 'high' ? 8.3e6 : (small || opt.quality === 'low' ? 1.0e6 : 2.0e6)) * qScale * qScale, k = Math.min(dpr, 2, Math.sqrt(budget / (cw * ch)));
      W = Math.max(2, Math.round(cw * k)); H = Math.max(2, Math.round(ch * k)); canvas.width = W; canvas.height = H;
      pxPerUnit = ch / (FINAL_Z * Math.tan(0.28));
      if (logoEl) { var lw = LW * pxPerUnit; logoEl.style.width = lw + 'px'; logoEl.style.height = lw + 'px'; logoEl.style.marginLeft = -lw / 2 + 'px'; logoEl.style.marginTop = -lw / 2 + 'px'; }
      if (titleEl) titleEl.style.marginTop = (RF + 0.2) * pxPerUnit + 'px';
    }

    function draw() {
      if (destroyed) return; var t0 = performance.now(), t = clamp(tl ? tl.time() : 0, 0, D), i, b;
      // beads: they form on the surface, roll together and merge into the main bead
      var vol = 0.2 * 0.2 * 0.2, arrived = 0, e, g;
      for (i = 0; i < NM; i++) { e = easeInOut(clamp((t - 0.4 - med[i].d) / 0.72, 0, 1)); arrived += Math.pow(med[i].r, 3) * sm(0.7, 1, e); }
      var settle = sm(1.15, 1.45, t), Rm = Math.cbrt(vol + arrived * 3.2), R = lerp(Rm, RF, settle);
      var wobA = t > 1.3 ? 0.05 * Math.exp(-(t - 1.3) * 4.2) * Math.sin((t - 1.3) * 24) : 0;
      var lift = easeInOut(clamp((t - 1.5) / 0.55, 0, 1)), kd = lerp(KD, 0, lift), cy = lerp(FY + kd * R * (1 - wobA), 0, lift);
      var bloom = logo ? 0 : sm(1.85, 2.15, t) * (1 - sm(2.25, 2.6, t)), Rv = R * (1 + 0.08 * bloom);
      beads.fill(0); smalls.fill(0);
      beads[0] = 0; beads[1] = cy; beads[2] = 0; beads[3] = Rv * sm(0, 0.3, t) * (1 + wobA * 0.6);
      for (i = 0; i < NM; i++) {
        b = med[i]; e = easeInOut(clamp((t - 0.4 - b.d) / 0.72, 0, 1)); g = sm(b.born - 0.04, b.born + 0.28, t); var rad = b.r * g * (lift > 0.02 ? 0 : 1);
        beads[(i + 1) * 4] = lerp(b.x, 0, e) + Math.sin(e * 3.14159) * b.bow * 0.6; beads[(i + 1) * 4 + 1] = FY + KD * rad; beads[(i + 1) * 4 + 2] = lerp(b.z, 0, e) + Math.sin(e * 3.14159) * b.bow * 0.35; beads[(i + 1) * 4 + 3] = rad;
      }
      for (i = 0; i < NS; i++) {
        b = sml[i]; g = sm(b.born, b.born + 0.3, t); e = easeInOut(clamp((t - 0.36 - b.d) / 0.78, 0, 1)); if (b.hold) e *= 0.82; // a third stay behind, like on a real surface
        var rr = b.r * g * (1 - sm(0.8, 1, e) * (b.hold ? 0.7 : 1)) * (lift > 0.02 ? 1 - lift : 1);
        smalls[i * 4] = lerp(b.x, 0, e) + Math.sin(e * 3.14159) * b.bow * 0.5; smalls[i * 4 + 1] = FY + KD * rr; smalls[i * 4 + 2] = lerp(b.z, 0, e) + Math.sin(e * 3.14159) * b.bow * 0.3; smalls[i * 4 + 3] = rr;
      }
      var k = 0.04 + 0.3 * sm(0.5, 1.2, t) * (1 - lift), morph = logo ? easeInOut(clamp((t - 1.62) / 0.5, 0, 1)) : 0;
      var sw1 = easeSoft(clamp((t - 0.1) / 1.0, 0, 1)), sw2 = easeSoft(clamp((t - 1.4) / 0.75, 0, 1));
      var ez = easeInOut(clamp(t / 2.15, 0, 1)), cz = lerp(7.3, FINAL_Z, ez), camY = lerp(0.42, 0.1, ez), ty = lerp(lerp(-0.4, -0.5, ez), 0, lift), fade = Math.sin(clamp(t / 0.3, 0, 1) * 1.5708);
      var floorA = (1 - sm(1.55, 2.05, t)) * fade;
      gl.viewport(0, 0, W, H); gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog); gl.bindVertexArray(vao); gl.activeTexture(gl.TEXTURE0); gl.uniform1i(U.uLogo, 0);
      gl.uniform2f(U.uRes, W, H); gl.uniform1f(U.uT, t); gl.uniform3f(U.uCam, 0, camY, cz); gl.uniform1f(U.uTy, ty); gl.uniform4fv(U.uB, beads); gl.uniform4fv(U.uSm, smalls); gl.uniform1f(U.uK, k);
      gl.uniform1f(U.uMorph, morph); gl.uniform1f(U.uFloorA, floorA); gl.uniform1f(U.uObjA, clamp(state.objA, 0, 1) * fade); gl.uniform1f(U.uBgA, clamp(state.bgA, 0, 1)); gl.uniform1f(U.uHas, logo ? 1 : 0); gl.uniform1f(U.uBloom, bloom);
      gl.uniform1f(U.uSpin, 0.55 * (1 - easeInOut(clamp((t - 1.7) / 0.5, 0, 1)))); gl.uniform1f(U.uLogoW, LW); gl.uniform1f(U.uLogoR, U.range);
      gl.uniform4f(U.uSw, lerp(-2.7, 2.7, sw1), Math.sin(sw1 * 3.14159) * 0.9, lerp(-2.7, 2.7, sw2), Math.sin(sw2 * 3.14159));
      gl.uniform1f(U.uFlash, Math.exp(-Math.pow((t - 2.1) / 0.1, 2))); gl.uniform1f(U.uFloorY, FY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      var upd = performance.now() - t0; ctl.stats.frames++; ctl.stats.updateMs += upd; ctl.stats.maxUpdateMs = Math.max(ctl.stats.maxUpdateMs, upd);
    }

    resize();
    tl = root.gsap.timeline({ paused: true, onUpdate: draw, defaults: { overwrite: false } });
    var ticker = { t: 0 }; tl.to(ticker, { t: D, duration: D, ease: 'none' }, 0);
    tl.set(rootEl, { pointerEvents: 'none' }, 1.95);
    tl.to(state, { objA: 0, duration: 0.2, ease: 'power1.in' }, 2.08);
    tl.to(state, { bgA: 0, duration: 0.5, ease: 'power2.inOut' }, 2.02);
    if (titleEl) {
      var letters = titleEl.querySelectorAll('span > span');
      tl.fromTo(letters, { yPercent: 115, opacity: 0, filter: 'blur(10px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out', stagger: 0.045 }, 1.5);
      tl.to(titleEl, { opacity: 0, duration: 0.2, ease: 'power1.in' }, 2.02);
    }
    if (targets.length) { root.gsap.set(targets, { opacity: 0, y: 10 }); tl.to(targets, { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out', stagger: 0.05, clearProps: 'opacity,transform' }, 2.0); }
    if (logoEl) { // only with a real logo: the sphere morphs into it, then it hands over to the flat vector logo and docks
      tl.fromTo(logoEl, { opacity: 0 }, { opacity: 1, duration: 0.14, ease: 'power1.out' }, 2.0);
      var tgt = opt.logoTarget ? doc.querySelector(opt.logoTarget) : null;
      if (tgt) {
        var dock = function () { var r = tgt.getBoundingClientRect(), lw = LW * pxPerUnit, vw = rootEl.clientWidth, vh = rootEl.clientHeight; return { x: r.left + r.width / 2 - vw / 2, y: r.top + r.height / 2 - vh / 2, s: Math.max(0.05, Math.min(r.width, r.height) / lw) }; };
        tl.to(logoEl, { x: function () { return dock().x; }, y: function () { return dock().y; }, scale: function () { return dock().s; }, duration: 0.36, ease: 'power3.inOut' }, 2.08);
        tl.to(logoEl, { opacity: 0, duration: 0.14, ease: 'power1.in' }, D - 0.14);
      } else { tl.to(logoEl, { opacity: 0, duration: 0.22, ease: 'power1.in' }, D - 0.22); }
    }
    rootEl.addEventListener('pointerdown', skip); doc.addEventListener('keydown', skip);
    ro = root.ResizeObserver ? new root.ResizeObserver(function () { resize(); if (tl && tl.paused()) draw(); }) : null; if (ro) ro.observe(rootEl);
    ctl.timeline = tl; ctl.skip = skip; ctl.seek = function (t) { tl.pause(); tl.time(t, false); draw(); };
    draw(); if (cover) cover.remove();
    if (!opt.paused) {
      var clock = 0, last = -1, prevT = 0, ft = []; ctl.timing.clockStart = performance.now();
      (function tick() {
        if (destroyed || finished) return; var now = performance.now(); if (last < 0) last = now; clock += Math.max(0, now - last) / 1000 * speed; last = now;
        if (clock >= D) { tl.time(D); ctl.timing.end = performance.now(); finish(); return; }
        if (prevT) { ft.push(now - prevT); if (ft.length >= 4) { var avg = ft.reduce(function (a, b) { return a + b; }, 0) / ft.length; ft = []; if (avg > 42 && qScale > 0.46) { qScale = Math.max(0.45, qScale * 0.78); ctl.stats.qScale = qScale; resize(); } } } prevT = now;
        tl.time(clock); raf = root.requestAnimationFrame(tick);
      })();
    }
    return ctl;
  }
  root.HydraEntrance = { play: play, version: '2.1.0-marketing' };
})(typeof window !== 'undefined' ? window : this);
