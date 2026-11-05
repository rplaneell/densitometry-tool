const { chromium } = require('playwright');
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
const U=(process.env.HOST_URL||('file://'+process.cwd()+'/host.html'))+'#seek';
(async()=>{const b=await chromium.launch({args:ARGS});const p=await b.newPage({viewport:{width:1280,height:720}});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.type()+': '+m.text().slice(0,160))});
await p.goto(U);await p.waitForTimeout(1500);
console.log('has controller:',await p.evaluate(()=>!!window.__he&&!!window.__he.timeline),'canvas:',await p.evaluate(()=>!!document.querySelector('#he-root canvas')));
const T=[0.15,0.45,0.8,1.15,1.45,1.68,1.85,2.0,2.2,2.35,2.49];
for(const t of T){await p.evaluate(t=>window.__he.seek(t),t);await p.waitForTimeout(120);await p.screenshot({path:'f_'+String(Math.round(t*100)).padStart(3,'0')+'.png'})}
console.log('errors:',errs);await b.close()})();
