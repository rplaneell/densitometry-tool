import re
ROOT='/tmp/claude-0/-home-user/faa7e493-6a02-5f44-8638-10e54b1b2622/scratchpad/'
lib=open(ROOT+'ext/echarts/echarts.min.js',encoding='utf8').read()
HEX={'06038E':'0A2463','04026B':'061744','3A43C8':'1B6CA8','9DB0F2':'A9CBE8','E8EBFA':'E6F0F8','5F6B7A':'5A6A7C','3F4854':'33414F','DDE2E9':'D8E1EB','F4F6F9':'EEF3F8',
     'B24A00':'C25E00','8F3B00':'8F4400','FBEFE6':'FDF1E4','0A6C8A':'0B7A5C','7A3300':'7A3A00','0B0FA8':'123A7A','2A32D0':'2B7FBF','0A0AA6':'1B6CA8','1A1EA0':'1B6CA8','12167F':'123A7A',
     '040369':'061744','8C9AD1':'A9CBE8','8996CC':'A9CBE8','A5B1DC':'B9D3EA','B5C1EC':'B9D3EA','D3DBF6':'D6E6F4','F7F8FF':'F2F7FC','F27E28':'E8892B'}
RGBA=[('6,3,142','10,36,99'),('58,67,200','27,108,168'),('157,176,242','169,203,232'),('4,2,107','6,23,68'),('2,1,60','3,12,38'),('143,59,0','143,68,0')]
def recolor_css(css):
    for a,b in HEX.items():
        css=re.sub('#'+a+r'\b','#'+b,css,flags=re.I); css=css.replace('%23'+a,'%23'+b).replace('%23'+a.lower(),'%23'+b)
    for a,b in RGBA:
        css=re.sub(r'rgba\(\s*'+a.replace(',',r'\s*,\s*')+r'\s*,',  'rgba('+b+',',css)
    return css
def svg_overrides():
    out=[]
    for a,b in HEX.items():
        for att in ('fill','stroke','stop-color'):
            out.append('svg [%s="#%s" i]{%s:#%s}'%(att,a,att,b))
    out.append('svg[style*="3F4854" i]{fill:#33414F!important}')
    return '\n'.join(out)+'\n'
def build(out, extra_css='', extra_js='', calm=True):
    c=open(ROOT+'trial/polish.css').read(); th=open(ROOT+'trial/theme.css').read(); ex=open(ROOT+'trial/explore.css').read(); j=open(ROOT+'trial/polish.js').read(); xj=open(ROOT+'trial/explore.js').read(); s=open(ROOT+'trial/original.html',encoding='utf8').read()
    # recolour only the page's own stylesheet(s)
    s=re.sub(r'<style>(.*?)</style>',lambda m:'<style>'+recolor_css(m.group(1))+'</style>',s,flags=re.S)
    early="<script>/*POLISH calm by default: uses the page's own calm mode; the Animations switch turns motion back on*/try{document.documentElement.classList.add('pq-calm')}catch(e){}</script>\n" if calm else ''
    styleblk='<style>\n/*CONSISTENCY: legacy chart colours mapped to the one palette*/\n'+svg_overrides()+c+th+ex+extra_css+'</style>\n'+early
    scriptblk='<script>\n/* Apache ECharts 5.5.1, Apache License 2.0, inlined unmodified */\n'+lib+'\n</script>\n<script>\n'+j+'</script>\n<script>\n'+xj+'</script>\n'+(('<script>\n'+extra_js+'</script>\n') if extra_js else '')
    t=s.replace('</head>',styleblk+'</head>').replace('</body>',scriptblk+'</body>')
    open(out,'w',encoding='utf8').write(t)
    # scripts of the original must all be present, unchanged and in order
    o=open(ROOT+'trial/original.html',encoding='utf8').read()
    so=re.findall(r'<script[^>]*>(.*?)</script>',o,re.S); st=re.findall(r'<script[^>]*>(.*?)</script>',t,re.S)
    it=iter(st); same=all(any(x==y for y in it) for x in so)
    print(out,'| original scripts intact:',same,'| size',len(t))

def build_all():
    R=ROOT+'trial/'
    build(R+'v_safe.html')
    build(R+'v_crazy.html', extra_css=open(R+'crazy.css').read(), calm=False)
    build(R+'v_super.html', extra_css=open(R+'super.css').read(), extra_js=open(R+'super.js').read(), calm=False)

if __name__=='__main__':
    build('polished.html'); build_all()
