const { chromium } = require('playwright');
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
(async()=>{const b=await chromium.launch({args:ARGS});const p=await b.newPage({viewport:{width:1280,height:720}});
await p.goto((process.env.HOST_URL||('file://'+process.cwd()+'/host.html'))+'#seek');await p.waitForTimeout(1500);
console.log('final reveal opacities at 2.49:',await p.evaluate(()=>{window.__he.seek(2.49);return ['.utilbar','.site-header','.hero','main'].map(s=>getComputedStyle(document.querySelector(s)).opacity).join(', ')}));
const FPS=30,N=Math.round(2.5*FPS);
for(let i=0;i<N;i++){const t=Math.min(i/FPS,2.495);await p.evaluate(t=>window.__he.seek(t),t);await p.screenshot({path:'vf/f_'+String(i).padStart(3,'0')+'.png'})}
console.log('frames',N);await b.close()})();
