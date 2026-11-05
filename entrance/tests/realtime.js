const { chromium } = require('playwright');
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
const U=(process.env.HOST_URL||('file://'+process.cwd()+'/host.html'))+'';
const WATCH=`(()=>{window.__ev={};const mo=new MutationObserver(()=>{const r=document.getElementById('he-root');if(r&&!__ev.start){__ev.start=performance.now()}if(!r&&__ev.start&&!__ev.end){__ev.end=performance.now()}});mo.observe(document,{childList:true,subtree:true});})()`;
(async()=>{const b=await chromium.launch({args:ARGS});
async function run(label,ctxOpts,after){const ctx=await b.newContext(ctxOpts);const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,120))});
 await p.addInitScript(WATCH);await p.goto(U);return {ctx,p,errs}}
// 1 desktop real time
{const {ctx,p,errs}=await run('desktop',{viewport:{width:1280,height:720}});
 const pe=[];for(let i=0;i<14;i++){await p.waitForTimeout(250);pe.push(await p.evaluate(()=>{const r=document.getElementById('he-root');return r?[+(performance.now()-(__ev.start||performance.now())).toFixed(0),getComputedStyle(r).pointerEvents]:null}))}
 const ev=await p.evaluate(()=>__ev);console.log('1. real time duration (ms):',Math.round(ev.end-ev.start),'(target 2500)');
 console.log('   pointer events by time:',pe.filter(Boolean).map(x=>x.join(':')).filter((x,i,a)=>i===0||x.split(':')[1]!==a[i-1].split(':')[1]).join('  ->  '));
 const st=await p.evaluate(()=>{const h=document.querySelector('.site-header'),u=document.querySelector('.utilbar');return {cover:!!document.getElementById('he-cover'),root:!!document.getElementById('he-root'),hdrOpacity:getComputedStyle(h).opacity,hdrTransform:getComputedStyle(h).transform,inlineOpacity:h.style.opacity,utilOpacity:getComputedStyle(u).opacity,canvases:document.querySelectorAll('#he-root canvas').length,done:!!(window.__he&&window.__he.done)}});console.log('   after:',JSON.stringify(st));
 await p.click('#pl-cust-btn');await p.waitForTimeout(500);console.log('   interactive: Customize panel opens ->',await p.evaluate(()=>document.getElementById('pl-cust').classList.contains('open')));
 await p.selectOption('#example','control');await p.waitForTimeout(900);console.log('   dashboard still works: example gel loaded ->',await p.evaluate(()=>!!window.__state));
 const s=await p.evaluate(()=>window.__he.stats);console.log('   JS time per frame: avg',(s.updateMs/s.frames).toFixed(2),'ms, max',s.maxUpdateMs.toFixed(2),'ms over',s.frames,'frames (software GL here, so frame count is not a speed measure)');
 console.log('   errors:',errs);await ctx.close()}
// 2 skip
{const {ctx,p,errs}=await run('skip',{viewport:{width:1280,height:720}});await p.waitForTimeout(450);await p.keyboard.press('Space');await p.waitForTimeout(1500);const ev=await p.evaluate(()=>__ev);console.log('2. skip with a key: finished',ev.end?Math.round(ev.end-ev.start)+' ms after start':'NOT FINISHED','| errors',errs.length);await ctx.close()}
// 3 reduced motion
{const {ctx,p,errs}=await run('reduced',{viewport:{width:1280,height:720},reducedMotion:'reduce'});await p.waitForTimeout(800);const r=await p.evaluate(()=>({overlayEver:!!__ev.start,cover:!!document.getElementById('he-cover'),hdr:getComputedStyle(document.querySelector('.site-header')).opacity,done:!!(window.__he&&window.__he.done)}));console.log('3. reduced motion:',JSON.stringify(r),'| errors',errs.length);await ctx.close()}
// 4 phone
{const {ctx,p,errs}=await run('phone',{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});await p.waitForTimeout(600);await p.screenshot({path:'phone_mid.png'});await p.waitForTimeout(2600);const r=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,root:!!document.getElementById('he-root'),done:!!(window.__he&&window.__he.done)}));console.log('4. phone 390x844:',JSON.stringify(r),'| errors',errs.length);await ctx.close()}
// 5 no WebGL available: must fall back to a plain dashboard
{const b2=await chromium.launch({args:['--disable-gpu','--disable-3d-apis','--disable-webgl','--disable-webgl2']});const p=await b2.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));await p.goto(U);await p.waitForTimeout(1200);console.log('5. no WebGL:',JSON.stringify(await p.evaluate(()=>({gl:!!document.createElement('canvas').getContext('webgl2'),root:!!document.getElementById('he-root'),cover:!!document.getElementById('he-cover'),hdr:getComputedStyle(document.querySelector('.site-header')).opacity,done:!!(window.__he&&window.__he.done)}))),'| errors',errs.length);await b2.close()}
await b.close()})();
