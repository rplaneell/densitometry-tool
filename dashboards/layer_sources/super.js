/*SUPER-JS neon cursor ring: decoration only*/
(function(){try{
  if(matchMedia('(hover:none)').matches)return;
  var r=document.createElement('div');r.id='pl-ring';r.setAttribute('aria-hidden','true');document.body.appendChild(r);
  var x=-100,y=-100,tx=-100,ty=-100,run=false;
  function loop(){x+=(tx-x)*.22;y+=(ty-y)*.22;r.style.transform='translate('+x+'px,'+y+'px)';if(Math.abs(tx-x)>.3||Math.abs(ty-y)>.3)requestAnimationFrame(loop);else run=false}
  addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;if(!run){run=true;requestAnimationFrame(loop)}},{passive:true});
  addEventListener('pointerover',function(e){r.classList.toggle('big',!!e.target.closest('a,button,select,input,summary,label'))},{passive:true});
}catch(e){}})();
