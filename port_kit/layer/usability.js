/*POLISH-START aesthetics and usability only, additive: reads and writes no scientific values*/
(function(){
  try{
    var d=document,h=d.documentElement;
    var bar=d.createElement('div');bar.id='pl-progress';bar.setAttribute('aria-hidden','true');d.body.appendChild(bar);
    var main=d.querySelector('main');
    if(main){if(!main.id)main.id='pl-main';main.setAttribute('tabindex','-1');
      var sk=d.createElement('a');sk.id='pl-skip';sk.href='#'+main.id;sk.textContent='Skip to content';d.body.insertBefore(sk,d.body.firstChild);}
    var hd=d.querySelector('.site-header'),tick=false;
    function onScroll(){if(tick)return;tick=true;requestAnimationFrame(function(){
      var max=h.scrollHeight-h.clientHeight;
      bar.style.transform='scaleX('+(max>0?Math.min(1,h.scrollTop/max):0)+')';
      if(hd)hd.classList.toggle('pl-scrolled',h.scrollTop>8);tick=false;});}
    addEventListener('scroll',onScroll,{passive:true});onScroll();
    var secs=[].slice.call(d.querySelectorAll('main > section[id]'));
    var links=[].slice.call(d.querySelectorAll('.stepnav a[href^="#"]'));
    var map=links.map(function(a){return{a:a,s:d.getElementById(a.getAttribute('href').slice(1))}}).filter(function(x){return x.s});
    if('IntersectionObserver' in window){
      var vis={};
      var spy=new IntersectionObserver(function(es){es.forEach(function(e){vis[e.target.id]=e.isIntersecting?e.intersectionRatio:0});
        var best=null,bv=0;map.forEach(function(x){var v=vis[x.s.id]||0;if(v>bv){bv=v;best=x}});
        map.forEach(function(x){x.a.classList.toggle('pl-active',x===best);if(x===best)x.a.setAttribute('aria-current','true');else x.a.removeAttribute('aria-current')});
      },{rootMargin:'-90px 0px -40% 0px',threshold:[0,.1,.25,.5,.75,1]});
      map.forEach(function(x){spy.observe(x.s)});
    }
    /* help card */
    var help=d.createElement('div');help.id='pl-help';help.setAttribute('role','dialog');help.setAttribute('aria-modal','true');help.setAttribute('aria-label','Keyboard shortcuts');
    help.innerHTML='<div class="box"><h2>Keyboard shortcuts</h2><dl><dt><kbd>J</kbd></dt><dd>Next section</dd><dt><kbd>K</kbd></dt><dd>Previous section</dd><dt><kbd>?</kbd></dt><dd>Show or hide this card</dd><dt><kbd>Esc</kbd></dt><dd>Close</dd></dl><p>Shortcuts pause while you type in a field.</p></div>';
    d.body.appendChild(help);
    function closeHelp(){help.classList.remove('open')}
    help.addEventListener('click',function(e){if(e.target===help)closeHelp()});
    function modalOpen(){return !!d.querySelector('.ly-modal.show,.ly-modal.open,.vm.show,.vm.open')}
    function go(dir){
      var cur=h.scrollTop,i=-1;
      secs.forEach(function(s,k){if(s.getBoundingClientRect().top+cur-110<=cur+2)i=k});
      var n=Math.max(0,Math.min(secs.length-1,i+dir));
      var y=secs[n].getBoundingClientRect().top+cur-110;
      window.scrollTo({top:Math.max(0,y),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
    }
    d.addEventListener('keydown',function(e){
      if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey)return;
      var t=e.target,tag=t&&t.tagName;
      if(e.key==='Escape'&&help.classList.contains('open')){closeHelp();return}
      if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable)||modalOpen())return;
      if(e.key==='?'){help.classList.toggle('open');e.preventDefault()}
      else if(e.key==='j'||e.key==='J'){go(1)}
      else if(e.key==='k'||e.key==='K'){go(-1)}
    });
  }catch(e){}
})();
/*POLISH-END*/
