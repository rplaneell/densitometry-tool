const { chromium } = require('playwright');
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
const U=(process.env.HOST_URL||('file://'+process.cwd()+'/host.html'))+'#seek';
(async()=>{const b=await chromium.launch({args:ARGS});const p=await b.newPage({viewport:{width:1280,height:720}});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.type()+': '+m.text().slice(0,300))});
await p.goto(U);await p.waitForTimeout(2500);
console.log('controller:',await p.evaluate(()=>!!window.__he&&!!window.__he.timeline),'canvas:',await p.evaluate(()=>!!document.querySelector('#he-root canvas')));
const T=(process.argv[2]||'0.2,0.5,0.8,1.1,1.35,1.55,1.8,2.0,2.15,2.3,2.45,2.59').split(',').map(Number);
for(const t of T){await p.evaluate(t=>window.__he.seek(t),t);await p.waitForTimeout(250);await p.screenshot({path:'m_'+String(Math.round(t*100)).padStart(3,'0')+'.png'})}
console.log('errors:',errs.slice(0,6));await b.close()})();
