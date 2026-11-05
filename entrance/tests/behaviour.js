const { chromium } = require('playwright');
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
const U=(process.env.HOST_URL||('file://'+process.cwd()+'/host.html'))+'';
(async()=>{const b=await chromium.launch({args:ARGS});
// pointer events by animation time (deterministic, paused mode)
{const p=await b.newPage({viewport:{width:1280,height:720}});await p.goto(U+'#seek');await p.waitForTimeout(1500);
 const out=[];for(const t of [0.3,1.0,1.69,1.72,2.0,2.4]){out.push(t+'s:'+await p.evaluate(t=>{window.__he.seek(t);return getComputedStyle(document.getElementById('he-root')).pointerEvents},t))}
 console.log('pointer events (overlay blocks clicks until the reveal starts at 1.7 s):',out.join('  '));
 // dashboard elements at the end of the choreography
 console.log('at t=2.49 reveal targets opacity:',await p.evaluate(()=>{window.__he.seek(2.49);return ['.utilbar','.site-header','.hero','main'].map(s=>getComputedStyle(document.querySelector(s)).opacity).join(', ')}));await p.close()}
// skip with a key, measured from inside
{const p=await b.newPage({viewport:{width:1280,height:720}});await p.goto(U);await p.waitForFunction(()=>window.__he&&window.__he.timing.clockStart>0);await p.waitForTimeout(400);await p.keyboard.press('Space');
 await p.waitForFunction(()=>window.__he.done,null,{timeout:20000});const t=await p.evaluate(()=>window.__he.timing);console.log('skip: key pressed ~0.4 s into the animation, finished after',Math.round(t.end-t.clockStart),'ms total (instead of 2500)');await p.close()}
await b.close()})();
