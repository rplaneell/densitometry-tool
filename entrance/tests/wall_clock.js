const { chromium } = require('playwright');
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
(async()=>{const b=await chromium.launch({args:ARGS});
for(const [w,h] of [[256,144],[480,270],[640,360]]){
 const p=await b.newPage({viewport:{width:w,height:h}});
 await p.goto((process.env.HOST_URL||('file://'+process.cwd()+'/host.html')));
 await p.waitForFunction(()=>window.__he&&window.__he.done,null,{timeout:60000});
 const r=await p.evaluate(()=>({wall:Math.round(__he.timing.end-__he.timing.clockStart),frames:__he.stats.frames,q:__he.stats.qScale||1}));
 console.log(w+'x'+h,'animation wall time',r.wall,'ms (target 2600) | frames drawn',r.frames,'| avg ms per frame',Math.round(r.wall/Math.max(r.frames,1)),'| governor scale',r.q);await p.close()}
await b.close()})();
