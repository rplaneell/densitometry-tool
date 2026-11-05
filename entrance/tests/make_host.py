import sys
base=sys.argv[1]; out=sys.argv[2]; script=sys.argv[3] if len(sys.argv)>3 else 'entrance.js'
h=open(base,encoding='utf8').read()
gsap=open('vendor/gsap.min.js',encoding='utf8').read(); ent=open(script,encoding='utf8').read()
cover_css='<style>#he-cover{position:fixed;inset:0;z-index:2147483000;background:#080B10}</style>\n'
init="""<script>
(function(){
  var seek = location.hash === '#seek';
  function go(){
    window.__he = HydraEntrance.play({
      paused: seek,
      reveal: ['.utilbar', '.site-header', '.hero', 'main'],
      logoTarget: '.site-header .brand',
      onDone: function(){ window.__heDone = performance.now(); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
</script>
"""
i=h.index('</head>'); h=h[:i]+cover_css+h[i:]
j=h.index('\n<body>')+len('\n<body>'); h=h[:j]+'<div id="he-cover"></div>'+h[j:]
k=h.rindex('</body>'); h=h[:k]+'<script>/* GSAP 3.12.7, GreenSock standard licence */\n'+gsap+'\n</script>\n<script>\n'+ent+'\n</script>\n'+init+h[k:]
open(out,'w',encoding='utf8').write(h); print('wrote',out,len(h))
