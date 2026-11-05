/*CUSTOM-START customize panel: appearance and plot settings only. Reads and writes no scientific values.*/
(function(){try{
  var d=document,root=d.documentElement;
  var TH={
    sapphire:{n:'Sapphire and jade',c:['#0A2463','#1B6CA8','#00E5A0'],v:{'--werfen':'#0A2463','--werfen-deep':'#061744','--blue500':'#1B6CA8','--blue300':'#A9CBE8','--blue100':'#E6F0F8','--jade':'#00E5A0','--on-accent':'#04152F','--g050':'#EEF3F8','--g200':'#D8E1EB','--g500':'#5A6A7C','--g700':'#33414F','--orange':'#C25E00','--orange-deep':'#8F4400','--orange-tint':'#FDF1E4','--teal':'#0B7A5C','--page':'#F4F7FA','--hero':'#061744'}},
    ocean:{n:'Ocean and coral',c:['#0B4F6C','#1B8FB5','#FF6B5E'],v:{'--werfen':'#0B4F6C','--werfen-deep':'#073549','--blue500':'#1B8FB5','--blue300':'#A8DCEB','--blue100':'#E3F4F9','--jade':'#FF6B5E','--on-accent':'#2A0A07','--g050':'#EDF5F8','--g200':'#D5E4EA','--g500':'#56707B','--g700':'#2F4650','--orange':'#B8650A','--orange-deep':'#864A06','--orange-tint':'#FCF0E2','--teal':'#0B7A5C','--page':'#F3F8FA','--hero':'#073549'}},
    slate:{n:'Slate and teal',c:['#243447','#4B6A88','#00B8A9'],v:{'--werfen':'#243447','--werfen-deep':'#16202C','--blue500':'#4B6A88','--blue300':'#B8C7D6','--blue100':'#E9EEF3','--jade':'#00B8A9','--on-accent':'#04201D','--g050':'#F0F2F5','--g200':'#DADFE5','--g500':'#5F6B78','--g700':'#363F4A','--orange':'#C25E00','--orange-deep':'#8F4400','--orange-tint':'#FDF1E4','--teal':'#0B7A5C','--page':'#F5F6F8','--hero':'#16202C'}},
    graphite:{n:'Graphite (print)',c:['#1F2933','#52606D','#1F2933'],v:{'--werfen':'#1F2933','--werfen-deep':'#121820','--blue500':'#52606D','--blue300':'#CBD2D9','--blue100':'#EDF0F2','--jade':'#1F2933','--on-accent':'#FFFFFF','--g050':'#F3F4F5','--g200':'#D9DDE1','--g500':'#5B6470','--g700':'#323A44','--orange':'#7A828C','--orange-deep':'#4B535C','--orange-tint':'#EEF0F2','--teal':'#3E4C59','--page':'#FAFAFA','--hero':'#121820'}},
    cb:{n:'Colour blind safe',c:['#0B2A5B','#0072B2','#009E73'],v:{'--werfen':'#0B2A5B','--werfen-deep':'#071A3A','--blue500':'#0072B2','--blue300':'#A9D2EC','--blue100':'#E6F1F9','--jade':'#009E73','--on-accent':'#FFFFFF','--g050':'#EEF3F8','--g200':'#D8E1EB','--g500':'#5A6A7C','--g700':'#33414F','--orange':'#D55E00','--orange-deep':'#9A4300','--orange-tint':'#FCEBDD','--teal':'#009E73','--page':'#F4F7FA','--hero':'#071A3A'}}
  };
  var ACC=['#00E5A0','#FF6B5E','#FFC857','#7C5CFF','#00B8D9','#E91E8C'];
  var HIGH={'--g500':'#2F3B4A','--g700':'#0F1822','--g200':'#8795A6'};
  var DEF={theme:'sapphire',accent:'',zoom:100,density:'comfy',heading:'serif',corners:'soft',contrast:'normal',nav:'auto',hero:'compact',motion:'calm',type:'bars',labels:false,grid:true,thick:14,fs:12,range:true,sort:'value',pal:'theme',log:false,remember:false};
  var S=JSON.parse(JSON.stringify(DEF)),KEY='pl-custom-v1';
  var TXT={en:{btn:'Customize',title:'Customize',sub:'Changes apply at once. They only affect how the page looks, never the results.',look:'Look',theme:'Colour theme',accent:'Accent colour',accentDef:'Theme default',size:'Text size',density:'Spacing',dC:'Compact',dN:'Comfortable',dR:'Roomy',heading:'Headings',hS:'Serif',hSa:'Sans',corners:'Corners',cSh:'Sharp',cSo:'Soft',cRo:'Round',contrast:'Contrast',cN:'Normal',cH:'High',layout:'Layout',nav:'Step menu',nA:'Side rail on wide screens',nT:'Top bar',hero:'Intro banner',hC:'Compact',hF:'Full',hH:'Hidden',motion:'Motion',mC:'Calm',mL:'Lively',plots:'Plots',type:'Chart type',tB:'Bars',tD:'Dots',labels:'Value labels',grid:'Grid lines',thick:'Mark size',fs:'Label size',range:'Show 95 % range',sort:'Sort samples',sV:'by value',sL:'by lane',sN:'by name',pal:'Plot palette',pT:'Follow page theme',pC:'Colour blind safe',pG:'Greyscale',log:'Log axis',save:'Save',remember:'Remember on this device',rememberNote:'Off by default: the page keeps nothing in the browser unless you tick this.',exp:'Export settings',imp:'Import settings',reset:'Reset all',close:'Close'},
    ca:{btn:'Personalitza',title:'Personalitza',sub:'Els canvis s’apliquen a l’instant. Només afecten l’aspecte de la pàgina, mai els resultats.',look:'Aspecte',theme:'Tema de colors',accent:'Color d’accent',accentDef:'El del tema',size:'Mida del text',density:'Espaiat',dC:'Compacte',dN:'Còmode',dR:'Ampli',heading:'Títols',hS:'Serif',hSa:'Sense serif',corners:'Cantonades',cSh:'Rectes',cSo:'Suaus',cRo:'Rodones',contrast:'Contrast',cN:'Normal',cH:'Alt',layout:'Disposició',nav:'Menú dels passos',nA:'Barra lateral en pantalles amples',nT:'Barra superior',hero:'Bàner d’introducció',hC:'Compacte',hF:'Complet',hH:'Amagat',motion:'Moviment',mC:'Tranquil',mL:'Animat',plots:'Gràfics',type:'Tipus de gràfic',tB:'Barres',tD:'Punts',labels:'Etiquetes de valor',grid:'Línies de quadrícula',thick:'Mida dels elements',fs:'Mida de les etiquetes',range:'Mostra l’interval del 95 %',sort:'Ordena les mostres',sV:'per valor',sL:'per carril',sN:'per nom',pal:'Paleta dels gràfics',pT:'Segueix el tema',pC:'Apta per a daltònics',pG:'Escala de grisos',log:'Eix logarítmic',save:'Desa',remember:'Recorda en aquest dispositiu',rememberNote:'Desactivat per defecte: la pàgina no desa res al navegador si no ho marques.',exp:'Exporta la configuració',imp:'Importa la configuració',reset:'Restableix-ho tot',close:'Tanca'}};
  function lang(){return(window.i18n&&window.i18n.lang==='ca')?'ca':'en'}
  function t(k){return TXT[lang()][k]||TXT.en[k]||k}
  function lum(h){var m=/^#?([0-9a-f]{6})$/i.exec(h);if(!m)return 0;var n=parseInt(m[1],16),f=function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(n>>16&255)+.7152*f(n>>8&255)+.0722*f(n&255)}
  var applied=[];
  function apply(){
    applied.forEach(function(k){root.style.removeProperty(k)});applied=[];
    var th=TH[S.theme]||TH.sapphire,v=Object.assign({},th.v);
    if(S.accent){v['--jade']=S.accent;v['--on-accent']=lum(S.accent)>.4?'#04152F':'#FFFFFF'}
    if(S.contrast==='high')Object.assign(v,HIGH);
    Object.keys(v).forEach(function(k){root.style.setProperty(k,v[k]);applied.push(k)});
    root.dataset.plDensity=S.density;root.dataset.plHeading=S.heading;root.dataset.plCorners=S.corners;root.dataset.plContrast=S.contrast;root.dataset.plNav=S.nav;root.dataset.plHero=S.hero;
    root.style.zoom=S.zoom===100?'':String(S.zoom/100);
    try{var calm=window.pqCalm&&window.pqCalm(),want=S.motion==='calm';
      if(typeof calm==='boolean'&&calm!==want){var ab=[].slice.call(d.querySelectorAll('.utilbar button')).filter(function(b){return/^(Animations|Animacions)/.test(b.textContent.trim())})[0];if(ab)ab.click()}}catch(e){}
    if(window.__plx){Object.assign(window.__plx.P,{type:S.type,labels:S.labels,grid:S.grid,thick:S.thick,fs:S.fs,range:S.range,sort:S.sort,pal:S.pal,log:S.log});window.__plx.refresh()}
    try{if(S.remember)localStorage.setItem(KEY,JSON.stringify(S));else localStorage.removeItem(KEY)}catch(e){}
  }
  try{var raw=localStorage.getItem(KEY);if(raw){var o=JSON.parse(raw);if(o&&typeof o==='object')S=Object.assign(S,o)}}catch(e){}
  var panel=d.createElement('div');panel.id='pl-cust';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Customize');
  d.body.appendChild(panel);
  function segc(k,opts){return'<div class="pls" role="group">'+opts.map(function(o){return'<button type="button" data-k="'+k+'" data-v="'+o[0]+'" aria-pressed="'+(String(S[k])===String(o[0]))+'">'+t(o[1])+'</button>'}).join('')+'</div>'}
  function ck(k,l){return'<label class="plck"><input type="checkbox" data-c="'+k+'"'+(S[k]?' checked':'')+'> '+t(l)+'</label>'}
  function sel(k,l,opts){return'<label class="plr"><span class="pll">'+t(l)+'</span><select data-s="'+k+'">'+opts.map(function(o){return'<option value="'+o[0]+'"'+(S[k]===o[0]?' selected':'')+'>'+t(o[1])+'</option>'}).join('')+'</select></label>'}
  function render(){
    var h='<div class="pltop"><h2>'+t('title')+'</h2><button type="button" class="plx" data-a="close" aria-label="'+t('close')+'">&times;</button></div><p class="plsub">'+t('sub')+'</p>';
    h+='<fieldset><legend>'+t('look')+'</legend><div class="plr"><span class="pll">'+t('theme')+'</span>'+Object.keys(TH).map(function(k){var c=TH[k].c;return'<button type="button" class="plsw" data-k="theme" data-v="'+k+'" aria-pressed="'+(S.theme===k)+'" title="'+TH[k].n+'" aria-label="'+TH[k].n+'"><i style="background:'+c[0]+'"></i><i style="background:'+c[1]+'"></i><i style="background:'+c[2]+'"></i></button>'}).join('')+'</div>';
    h+='<div class="plr"><span class="pll">'+t('accent')+'</span>'+ACC.map(function(a){return'<button type="button" class="pldot" data-k="accent" data-v="'+a+'" style="background:'+a+'" aria-pressed="'+(S.accent===a)+'" aria-label="'+a+'"></button>'}).join('')+'<input type="color" data-color value="'+(S.accent||TH[S.theme].v['--jade'])+'" aria-label="'+t('accent')+'"><button type="button" class="pls" style="padding:5px 10px;border:1px solid var(--g200);background:#fff;cursor:pointer;font:600 12px var(--font)" data-k="accent" data-v="">'+t('accentDef')+'</button></div>';
    h+='<div class="plr"><span class="pll">'+t('size')+'</span><div class="pls" role="group">'+[90,100,110,125].map(function(z){return'<button type="button" data-k="zoom" data-v="'+z+'" aria-pressed="'+(S.zoom===z)+'">'+z+' %</button>'}).join('')+'</div></div>';
    h+='<div class="plr"><span class="pll">'+t('density')+'</span>'+segc('density',[['compact','dC'],['comfy','dN'],['roomy','dR']])+'</div>';
    h+='<div class="plr"><span class="pll">'+t('heading')+'</span>'+segc('heading',[['serif','hS'],['sans','hSa']])+'</div>';
    h+='<div class="plr"><span class="pll">'+t('corners')+'</span>'+segc('corners',[['sharp','cSh'],['soft','cSo'],['round','cRo']])+'</div>';
    h+='<div class="plr"><span class="pll">'+t('contrast')+'</span>'+segc('contrast',[['normal','cN'],['high','cH']])+'</div></fieldset>';
    h+='<fieldset><legend>'+t('layout')+'</legend><div class="plr"><span class="pll">'+t('nav')+'</span>'+segc('nav',[['auto','nA'],['top','nT']])+'</div><div class="plr"><span class="pll">'+t('hero')+'</span>'+segc('hero',[['compact','hC'],['full','hF'],['hidden','hH']])+'</div><div class="plr"><span class="pll">'+t('motion')+'</span>'+segc('motion',[['calm','mC'],['lively','mL']])+'</div></fieldset>';
    h+='<fieldset><legend>'+t('plots')+'</legend><div class="plr"><span class="pll">'+t('type')+'</span>'+segc('type',[['bars','tB'],['dots','tD']])+'</div>'+ck('labels','labels')+ck('grid','grid')+ck('range','range')+ck('log','log')+
      '<div class="plr"><span class="pll">'+t('thick')+'</span><input type="range" min="8" max="26" step="1" value="'+S.thick+'" data-r="thick" aria-label="'+t('thick')+'"></div><div class="plr"><span class="pll">'+t('fs')+'</span><input type="range" min="10" max="16" step="1" value="'+S.fs+'" data-r="fs" aria-label="'+t('fs')+'"></div>'+
      sel('sort','sort',[['value','sV'],['lane','sL'],['name','sN']])+sel('pal','pal',[['theme','pT'],['cb','pC'],['grey','pG']])+'</fieldset>';
    h+='<fieldset><legend>'+t('save')+'</legend>'+ck('remember','remember')+'<p class="plnote">'+t('rememberNote')+'</p><div class="plact"><button type="button" data-a="export">'+t('exp')+'</button><button type="button" data-a="import">'+t('imp')+'</button><button type="button" data-a="reset">'+t('reset')+'</button></div><input type="file" accept=".json,application/json" hidden data-file></fieldset>';
    var fo=d.activeElement&&panel.contains(d.activeElement)?d.activeElement.getAttribute('data-k')+'|'+d.activeElement.getAttribute('data-v'):null;
    panel.innerHTML=h;
    if(fo){var sel2=panel.querySelector('[data-k="'+fo.split('|')[0]+'"][data-v="'+fo.split('|')[1]+'"]');if(sel2)sel2.focus()}
  }
  function set(k,v){S[k]=v;apply();render()}
  panel.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
    if(b.dataset.a==='close'){close();return}
    if(b.dataset.a==='reset'){S=JSON.parse(JSON.stringify(DEF));apply();render();return}
    if(b.dataset.a==='export'){var a=d.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.download='dashboard_settings.json';d.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);return}
    if(b.dataset.a==='import'){panel.querySelector('[data-file]').click();return}
    if(b.dataset.k){var v=b.dataset.v;if(b.dataset.k==='zoom')v=+v;set(b.dataset.k,v)}});
  panel.addEventListener('change',function(e){var x=e.target;
    if(x.dataset.c){S[x.dataset.c]=x.checked;apply();return}
    if(x.dataset.s){S[x.dataset.s]=x.value;apply();return}
    if(x.dataset.file!==undefined&&x.files&&x.files[0]){var rd=new FileReader();rd.onload=function(){try{var o=JSON.parse(String(rd.result));if(o&&typeof o==='object'){S=Object.assign(JSON.parse(JSON.stringify(DEF)),o);apply();render()}}catch(err){}};rd.readAsText(x.files[0]);x.value='';return}});
  panel.addEventListener('input',function(e){var x=e.target;
    if(x.dataset.r){S[x.dataset.r]=+x.value;apply();return}
    if(x.dataset.color!==undefined){S.accent=x.value;apply()}});
  var btn=null,lastFocus=null;
  function open(){lastFocus=d.activeElement;render();panel.classList.add('open');var f=panel.querySelector('button,input,select');if(f)f.focus()}
  function close(){panel.classList.remove('open');if(lastFocus&&lastFocus.focus)lastFocus.focus()}
  function mount(){var bar=d.querySelector('.utilbar .wrap'),lg=bar&&bar.querySelector('.lang');if(!bar)return;
    btn=d.createElement('button');btn.type='button';btn.id='pl-cust-btn';btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg><span>'+t('btn')+'</span>';
    btn.addEventListener('click',function(){panel.classList.contains('open')?close():open()});
    var anim=[].slice.call(bar.querySelectorAll('button')).filter(function(b){return/^(Animations|Animacions)/.test(b.textContent.trim())})[0];
    (lg||anim||bar.lastChild)&&bar.insertBefore(btn,anim||lg);}
  mount();
  d.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&panel.classList.contains('open')){close();return}
    if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey)return;var tg=e.target,tag=tg&&tg.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(tg&&tg.isContentEditable))return;
    if(e.key==='c'||e.key==='C'){panel.classList.contains('open')?close():open();e.preventDefault()}});
  [].forEach.call(d.querySelectorAll('.lang button'),function(b){b.addEventListener('click',function(){setTimeout(function(){if(btn)btn.querySelector('span').textContent=t('btn');if(panel.classList.contains('open'))render()},300)})});
  try{var dl=d.querySelector('#pl-help dl');if(dl)dl.insertAdjacentHTML('beforeend','<dt><kbd>C</kbd></dt><dd>Customize</dd>')}catch(e){}
  setTimeout(apply,0);
}catch(e){}})();
/*CUSTOM-END*/
