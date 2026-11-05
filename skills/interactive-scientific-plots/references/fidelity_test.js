const { chromium } = require('playwright');
const f=process.argv[2]||'polished.html', tag=process.argv[3]||'ex';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1000}});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,100))});
await p.goto('file:///tmp/claude-0/-home-user/faa7e493-6a02-5f44-8638-10e54b1b2622/scratchpad/trial/'+f);await p.waitForTimeout(1200);
await p.selectOption('#example','control');await p.waitForTimeout(1200);await p.selectOption('#example','sample');await p.waitForTimeout(1800);
const vis=await p.evaluate(()=>{const e=document.getElementById('pl-explore');return e&&!e.hidden});
console.log('panel visible:',vis);
if(vis){
 // fidelity: plotted values vs page state
 console.log(JSON.stringify(await p.evaluate(()=>{const S=window.__state;const inst=echarts.getInstanceByDom(document.querySelector('#pl-explore .chart'));const o=inst.getOption();
   const rows=S.L.filter(r=>r.type==='sample'&&isFinite(r.mgL));const plotted=o.series[0].data.map(d=>d.value).sort((a,b)=>b-a);const truth=rows.map(r=>r.mgL).sort((a,b)=>b-a);
   const rng=(o.series[1]?o.series[1].data:[]).map(d=>d[1]+'-'+d[2]).sort();const tr=rows.map(r=>r.lo+'-'+r.hi).sort();
   return{n:plotted.length,valuesExact:JSON.stringify(plotted)===JSON.stringify(truth),rangesExact:JSON.stringify(rng)===JSON.stringify(tr)}})));
 await p.evaluate(()=>document.getElementById('pl-explore').scrollIntoView({block:'center'}));await p.waitForTimeout(600);
 await p.screenshot({path:tag+'_results.png'});
 // hover first bar
 const box=await p.locator('#pl-explore .chart').boundingBox();await p.mouse.move(box.x+260,box.y+30);await p.waitForTimeout(500);await p.screenshot({path:tag+'_hover.png'});
 await p.click('#pl-explore .tabs button[data-v=curve]');await p.waitForTimeout(700);await p.screenshot({path:tag+'_curve.png'});
 console.log(JSON.stringify(await p.evaluate(()=>{const S=window.__state;const inst=echarts.getInstanceByDom(document.querySelector('#pl-explore .chart'));const o=inst.getOption();
   const ctrl=S.L.filter(r=>r.type==='control'&&r.ng>0&&r.vol>0).map(r=>r.ng+':'+r.vol).sort();const pl=o.series[1].data.map(d=>d.value[0]+':'+d.value[1]).sort();
   const mid=o.series[0].data[40];return{ctrlExact:JSON.stringify(ctrl)===JSON.stringify(pl),fitMatchesPage:Math.abs(S.curve.fwd(mid[0])-mid[1])===0}})));
}
console.log('errors:',errs);await b.close()})();
