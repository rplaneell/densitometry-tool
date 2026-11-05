/*EXPLORE-START interactive explorer: READ ONLY. Reads window.__state and the results table; calculates nothing; writes nothing back.*/
(function(){
  try{
    if(!window.echarts)return;
    var d=document,res=d.getElementById('resWrap');if(!res||!res.parentNode)return;
    var T={en:{title:'Interactive explorer',results:'Results',curve:'Standard curve',sort:'Sort',byValue:'by value',byLane:'by lane',byName:'by name',range:'95 % range',log:'Log axis',pal:'Palette',blue:'Blue and jade',cb:'Colour blind safe',grey:'Greyscale (print)',reset:'Reset zoom',save:'Save image',mg:'mg/L',lane:'lane',avgNote:'Each lane is shown separately here. The chart above averages lanes with the same name when that switch is on.',note:'Read only view of the numbers above. Wheel or drag to zoom, hover for details.',ctrl:'control',smp:'sample',fit:'fitted curve',work:'working range',ng:'ng in lane',vol:'band volume'},
      ca:{title:'Explorador interactiu',results:'Resultats',curve:'Corba patró',sort:'Ordena',byValue:'per valor',byLane:'per carril',byName:'per nom',range:'Interval del 95 %',log:'Eix logarítmic',pal:'Paleta',blue:'Blau i jade',cb:'Apta per a daltònics',grey:'Escala de grisos (impressió)',reset:'Restableix el zoom',save:'Desa la imatge',mg:'mg/L',lane:'carril',avgNote:'Aquí cada carril es mostra per separat. El gràfic de dalt fa la mitjana dels carrils amb el mateix nom quan aquest interruptor és activat.',note:'Vista només de lectura dels números de dalt. Roda o arrossega per fer zoom, passa el ratolí per veure detalls.',ctrl:'control',smp:'mostra',fit:'corba ajustada',work:'interval de treball',ng:'ng al carril',vol:'volum de banda'}};
    function lang(){return(window.i18n&&window.i18n.lang==='ca')?'ca':'en'}
    function t(k){return(T[lang()][k]||T.en[k]||k)}
    function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
    var P={view:'results',sort:'value',range:true,log:false,pal:'blue'},chart=null,box=d.createElement('div');
    box.id='pl-explore';box.hidden=true;res.parentNode.insertBefore(box,res.nextSibling);
    function css(v,f){var x=getComputedStyle(d.documentElement).getPropertyValue(v).trim();return x||f}
    function pal(){
      if(P.pal==='cb')return{bar:'#E69F00',err:'#111111',flag:'#E69F00',hot:'#009E73',ctrl:'#0072B2',smp:'#D55E00',line:'#444444',band:'rgba(0,114,178,.08)',txt:'#222',grid:'#D8D8D8'};
      if(P.pal==='grey')return{bar:'#6B7785',err:'#1F2933',flag:'#9AA5B1',hot:'#1F2933',ctrl:'#52606D',smp:'#1F2933',line:'#3E4C59',band:'rgba(31,41,51,.07)',txt:'#222',grid:'#D8D8D8'};
      return{bar:css('--orange','#C25E00'),err:css('--werfen','#0A2463'),flag:css('--orange','#C25E00'),hot:css('--jade','#00E5A0'),ctrl:css('--blue500','#1B6CA8'),smp:css('--werfen','#0A2463'),line:css('--werfen','#0A2463'),band:'rgba(27,108,168,.08)',txt:css('--g700','#33414F'),grid:css('--g200','#D8E1EB')};
    }
    function tableInfo(){
      var tb=[].slice.call(res.querySelectorAll('table.res')).filter(function(t){return !t.classList.contains('rank')&&t.rows[0]&&t.rows[0].children.length>=8})[0],o={head:[],rows:{}};if(!tb)return o;
      var tr=[].slice.call(tb.querySelectorAll('tr'));
      if(tr[0])o.head=[].slice.call(tr[0].children).map(function(c){return c.textContent.trim()});
      tr.slice(1).forEach(function(r){var c=[].slice.call(r.children).map(function(x){return x.textContent.trim()});if(c.length>=8)o.rows[c[0]]=c});
      return o;
    }
    function ui(){
      var h='<div class="xh"><h3>'+t('title')+'</h3><div class="tabs" role="group">'+
        '<button type="button" data-v="results" aria-pressed="'+(P.view==='results')+'">'+t('results')+'</button>'+
        '<button type="button" data-v="curve" aria-pressed="'+(P.view==='curve')+'">'+t('curve')+'</button></div></div><div class="ctl">';
      if(P.view==='results')h+='<label>'+t('sort')+' <select data-k="sort"><option value="value"'+(P.sort==='value'?' selected':'')+'>'+t('byValue')+'</option><option value="lane"'+(P.sort==='lane'?' selected':'')+'>'+t('byLane')+'</option><option value="name"'+(P.sort==='name'?' selected':'')+'>'+t('byName')+'</option></select></label>'+
        '<label><input type="checkbox" data-k="range"'+(P.range?' checked':'')+'> '+t('range')+'</label>';
      h+='<label><input type="checkbox" data-k="log"'+(P.log?' checked':'')+'> '+t('log')+'</label>'+
        '<label>'+t('pal')+' <select data-k="pal"><option value="blue"'+(P.pal==='blue'?' selected':'')+'>'+t('blue')+'</option><option value="cb"'+(P.pal==='cb'?' selected':'')+'>'+t('cb')+'</option><option value="grey"'+(P.pal==='grey'?' selected':'')+'>'+t('grey')+'</option></select></label>'+
        '<button type="button" data-a="reset">'+t('reset')+'</button><button type="button" data-a="save">'+t('save')+'</button></div>'+
        '<div class="chart" role="img" aria-label="'+esc(P.view==='results'?t('results'):t('curve'))+'"></div><p class="xn">'+t('note')+'</p>';
      box.innerHTML=h;
    }
    function resultsOption(S,C){
      var info=tableInfo(),rows=S.L.filter(function(r){return r.type==='sample'&&isFinite(r.mgL)});
      if(!rows.length)return null;
      if(P.sort==='lane')rows.sort(function(a,b){return a.lane-b.lane});
      else if(P.sort==='name')rows.sort(function(a,b){return String(a.name).localeCompare(String(b.name))||a.lane-b.lane});
      else rows.sort(function(a,b){return b.mgL-a.mgL});
      var logOk=rows.every(function(r){return r.mgL>0&&r.lo>0&&r.hi>0}),useLog=P.log&&logOk,prov=!!(S.curve&&S.curve.provisional),H=info.head;
      var bars=rows.map(function(r){var low=r.flag==='below working range'||r.flag==='not above the mock lane'||prov;
        return{value:r.mgL,itemStyle:{color:C.bar,decal:low?{symbol:'rect',dashArrayX:[1,0],dashArrayY:[2,6],rotation:Math.PI/4,color:'rgba(255,255,255,.45)'}:null}}});
      var series=[{type:'bar',data:bars,barWidth:14,emphasis:{itemStyle:{color:C.hot,borderColor:C.err,borderWidth:1}},z:2}];
      if(P.range)series.push({type:'custom',silent:true,z:3,data:rows.map(function(r,i){return[i,r.lo,r.hi]}),
        renderItem:function(p,api){var i=api.value(0),a=api.coord([api.value(1),i]),b=api.coord([api.value(2),i]),s={stroke:C.err,lineWidth:1.4};
          return{type:'group',children:[{type:'line',shape:{x1:a[0],y1:a[1],x2:b[0],y2:b[1]},style:s},{type:'line',shape:{x1:a[0],y1:a[1]-5,x2:a[0],y2:a[1]+5},style:s},{type:'line',shape:{x1:b[0],y1:b[1]-5,x2:b[0],y2:b[1]+5},style:s}]}}});
      var n=rows.length;box.querySelector('.chart').style.height=Math.max(240,90+n*32)+'px';
      return{opt:{animation:false,textStyle:{fontFamily:'inherit'},grid:{left:150,right:24,top:12,bottom:46,containLabel:false},
        tooltip:{trigger:'item',confine:true,formatter:function(p){if(p.seriesType!=='bar')return'';var r=rows[p.dataIndex],c=info.rows[String(r.lane)]||[],tag=function(i,l){return c[i]?'<br>'+esc((H[i]||l))+': <b>'+esc(c[i])+'</b>':''};
          return'<b>'+esc(r.name)+'</b> ('+t('lane')+' '+esc(r.lane)+')'+tag(5,t('mg'))+tag(6,t('range'))+tag(2,t('vol'))+tag(3,t('ng'))+tag(4,'µL')+tag(7,'')}},
        xAxis:{type:useLog?'log':'value',name:t('mg'),nameLocation:'middle',nameGap:30,min:useLog?undefined:0,axisLabel:{color:C.txt},nameTextStyle:{color:C.txt,fontWeight:700},splitLine:{lineStyle:{color:C.grid}}},
        yAxis:{type:'category',inverse:true,data:rows.map(function(r,i){return String(i)}),axisLabel:{color:C.txt,width:140,overflow:'truncate',formatter:function(v){return rows[+v].name}},axisTick:{show:false},axisLine:{lineStyle:{color:C.grid}}},
        dataZoom:[{type:'inside',xAxisIndex:0,filterMode:'none'}].concat(n>12?[{type:'slider',yAxisIndex:0,right:2,width:14,filterMode:'none'}]:[]),
        series:series},extra:(S.avg?t('avgNote'):'')};
    }
    function curveOption(S,C){
      var c=S.curve;if(!c||typeof c.fwd!=='function')return null;
      var ctrl=S.L.filter(function(r){return r.type==='control'&&r.ng>0&&r.vol>0}),smp=S.L.filter(function(r){return r.type==='sample'&&r.vol>0&&r.ngRead>0});
      var xs=ctrl.map(function(r){return r.ng}).concat(smp.map(function(r){return r.ngRead}),c.rangeNg||[]);if(!xs.length)return null;
      var x0=Math.min.apply(null,xs)*0.6,x1=Math.max.apply(null,xs)*1.6,line=[],k;
      for(k=0;k<=80;k++){var x=x0*Math.pow(x1/x0,k/80);line.push([x,c.fwd(x)])}
      box.querySelector('.chart').style.height='380px';
      var fmt=function(v){return Math.round(v).toLocaleString('en-US')};
      return{opt:{animation:false,textStyle:{fontFamily:'inherit'},grid:{left:78,right:24,top:16,bottom:84},legend:{bottom:0,textStyle:{color:C.txt}},
        tooltip:{trigger:'item',confine:true,formatter:function(p){if(p.seriesName===t('fit')||p.seriesName===t('work'))return'';var r=p.data.r;return'<b>'+esc(r.name)+'</b> ('+t('lane')+' '+esc(r.lane)+')<br>'+t('ng')+': <b>'+Number(p.data.value[0]).toPrecision(4)+'</b><br>'+t('vol')+': <b>'+fmt(p.data.value[1])+'</b>'}},
        xAxis:{type:'log',name:t('ng'),nameLocation:'middle',nameGap:32,min:x0,max:x1,axisLabel:{color:C.txt},nameTextStyle:{color:C.txt,fontWeight:700},splitLine:{lineStyle:{color:C.grid}}},
        yAxis:{type:'log',name:t('vol'),axisLabel:{color:C.txt,formatter:function(v){return v>=1e6?(v/1e6)+'M':v>=1e3?(v/1e3)+'k':v}},nameTextStyle:{color:C.txt,fontWeight:700},splitLine:{lineStyle:{color:C.grid}},scale:true},
        dataZoom:[{type:'inside',xAxisIndex:0,filterMode:'none'},{type:'inside',yAxisIndex:0,filterMode:'none'}],
        series:[{name:t('fit'),type:'line',data:line,showSymbol:false,silent:true,lineStyle:{color:C.line,width:2},markArea:(c.rangeNg&&c.rangeNg.length===2)?{silent:true,itemStyle:{color:C.band},data:[[{xAxis:c.rangeNg[0]},{xAxis:c.rangeNg[1]}]]}:undefined,z:1},
          {name:t('ctrl'),type:'scatter',symbolSize:11,itemStyle:{color:C.ctrl},emphasis:{itemStyle:{color:C.hot,borderColor:C.err,borderWidth:1.5}},data:ctrl.map(function(r){return{value:[r.ng,r.vol],r:r}}),z:3},
          {name:t('smp'),type:'scatter',symbol:'diamond',symbolSize:13,itemStyle:{color:C.smp},emphasis:{itemStyle:{color:C.hot,borderColor:C.err,borderWidth:1.5}},data:smp.map(function(r){return{value:[r.ngRead,r.vol],r:r}}),z:3}]},extra:''};
    }
    var busy=false;
    function refresh(){
      if(busy)return;busy=true;
      try{
        var S=window.__state;
        if(!S||S.mode==='ERR'||!S.L||!S.L.some(function(r){return r.type==='sample'&&isFinite(r.mgL)})){box.hidden=true;if(chart){chart.dispose();chart=null}return}
        var prevHidden=box.hidden;box.hidden=false;ui();
        var node=box.querySelector('.chart');if(chart){chart.dispose();chart=null}
        var o=(P.view==='results'?resultsOption:curveOption)(S,pal());
        if(!o){box.hidden=true;return}
        chart=echarts.init(node,null,{renderer:'canvas'});chart.setOption(o.opt);
        if(o.extra)box.querySelector('.xn').textContent=o.extra+' '+t('note');
      }catch(e){box.hidden=true;try{console.warn('explorer:',e&&e.message)}catch(_){}}
      finally{busy=false}
    }
    box.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
      if(b.dataset.v){P.view=b.dataset.v;refresh()}
      else if(b.dataset.a==='reset'&&chart){chart.dispatchAction({type:'dataZoom',start:0,end:100});chart.dispatchAction({type:'dataZoom',dataZoomIndex:1,start:0,end:100})}
      else if(b.dataset.a==='save'&&chart){var a=d.createElement('a');a.href=chart.getDataURL({pixelRatio:2,backgroundColor:'#ffffff'});a.download='interactive_'+P.view+'.png';d.body.appendChild(a);a.click();a.remove()}});
    box.addEventListener('change',function(e){var k=e.target.dataset.k;if(!k)return;P[k]=(e.target.type==='checkbox')?e.target.checked:e.target.value;refresh()});
    var tm=null;function later(){clearTimeout(tm);tm=setTimeout(refresh,150)}
    new MutationObserver(later).observe(res,{childList:true});
    addEventListener('resize',function(){if(chart)chart.resize()});
    [].forEach.call(d.querySelectorAll('.lang button'),function(b){b.addEventListener('click',function(){setTimeout(refresh,300)})});
    later();
  }catch(e){}
})();
/*EXPLORE-END*/
