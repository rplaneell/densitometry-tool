const { chromium } = require('playwright');
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
(async()=>{const b=await chromium.launch({args:ARGS});const p=await b.newPage({viewport:{width:1280,height:720}});
await p.goto((process.env.HOST_URL||('file://'+process.cwd()+'/host.html'))+'');
await p.waitForFunction(()=>window.__he&&window.__he.done,null,{timeout:30000});
const t=await p.evaluate(()=>window.__he.timing);
console.log('setup before clock (ms):',Math.round(t.clockStart-t.t0),'| animation wall time (ms):',Math.round(t.end-t.clockStart),'| frames drawn:',t.ticks.length);
console.log('clock samples (frame time ms, animation clock s):',JSON.stringify(t.ticks.slice(0,12)),'...');
await b.close()})();
