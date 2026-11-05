const { chromium } = require('playwright');
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
(async()=>{const b=await chromium.launch({args:ARGS});const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto((process.env.HOST_URL||('file://'+process.cwd()+'/host.html'))+'#seek');await p.waitForTimeout(2500);
const D=2.6,FPS=30,N=Math.round(D*FPS);
for(let i=0;i<N;i++){const t=Math.min(i/FPS,D-0.005);await p.evaluate(t=>window.__he.seek(t),t);await p.screenshot({path:'vm/f_'+String(i).padStart(3,'0')+'.png'})}
console.log('frames',N,'errors',errs.length);await b.close()})();
