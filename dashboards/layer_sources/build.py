import re
ROOT='/tmp/claude-0/-home-user/faa7e493-6a02-5f44-8638-10e54b1b2622/scratchpad/'
lib=open(ROOT+'ext/echarts/echarts.min.js',encoding='utf8').read()
HEX={'06038E':'0A2463','04026B':'061744','3A43C8':'1B6CA8','9DB0F2':'A9CBE8','E8EBFA':'E6F0F8','5F6B7A':'5A6A7C','3F4854':'33414F','DDE2E9':'D8E1EB','F4F6F9':'EEF3F8',
     'B24A00':'C25E00','8F3B00':'8F4400','FBEFE6':'FDF1E4','0A6C8A':'0B7A5C','7A3300':'7A3A00','0B0FA8':'123A7A','2A32D0':'2B7FBF','0A0AA6':'1B6CA8','1A1EA0':'1B6CA8','12167F':'123A7A',
     '040369':'061744','8C9AD1':'A9CBE8','8996CC':'A9CBE8','A5B1DC':'B9D3EA','B5C1EC':'B9D3EA','D3DBF6':'D6E6F4','F7F8FF':'F2F7FC','F27E28':'E8892B'}
RGBA=[('6,3,142','10,36,99'),('58,67,200','27,108,168'),('157,176,242','169,203,232'),('4,2,107','6,23,68'),('2,1,60','3,12,38'),('143,59,0','143,68,0')]
VAR={'06038E':'--werfen','04026B':'--werfen-deep','3A43C8':'--blue500','9DB0F2':'--blue300','E8EBFA':'--blue100','5F6B7A':'--g500','3F4854':'--g700','DDE2E9':'--g200','F4F6F9':'--g050','B24A00':'--orange','8F3B00':'--orange-deep','FBEFE6':'--orange-tint','0A6C8A':'--teal','0A0AA6':'--blue500','1A1EA0':'--blue500','12167F':'--werfen','0B0FA8':'--werfen','2A32D0':'--blue500','040369':'--werfen-deep','8C9AD1':'--blue300','8996CC':'--blue300','A5B1DC':'--blue300','B5C1EC':'--blue300','D3DBF6':'--blue100','F7F8FF':'--blue100','F27E28':'--orange','7A3300':'--orange-deep'}
def recolor_css(css):
    i=css.find(':root{'); j=css.find('}',i) if i>=0 else -1
    if i>=0 and j>i:
        return _recolor_literal(css[:i+6])+_recolor_literal(css[i+6:j])+_recolor_vars(css[j:])
    return _recolor_vars(css)
def _recolor_vars(css):
    for a,v in VAR.items():
        css=re.sub('(?<![0-9A-Za-z%])#'+a+r'\b','var('+v+')',css,flags=re.I)
        css=css.replace('%23'+a,'%23'+HEX[a]).replace('%23'+a.lower(),'%23'+HEX[a])
    for a,b2 in RGBA:
        css=re.sub(r'rgba\(\s*'+a.replace(',',r'\s*,\s*')+r'\s*,','rgba('+b2+',',css)
    return css
def _recolor_literal(css):
    for a,b in HEX.items():
        css=re.sub('#'+a+r'\b','#'+b,css,flags=re.I); css=css.replace('%23'+a,'%23'+b).replace('%23'+a.lower(),'%23'+b)
    for a,b in RGBA:
        css=re.sub(r'rgba\(\s*'+a.replace(',',r'\s*,\s*')+r'\s*,',  'rgba('+b+',',css)
    return css
def svg_overrides():
    out=[]
    for a,b in HEX.items():
        for att in ('fill','stroke','stop-color'):
            out.append('svg [%s="#%s" i]{%s:var(%s)}'%(att,a,att,VAR[a]))
    out.append('svg[style*="3F4854" i]{fill:var(--g700)!important}')
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
    build(R+'v_custom.html', extra_css=open(R+'custom.css').read()+open(R+'glass.css').read(), extra_js=open(R+'glass.js').read()+'\n'+open(R+'custom.js').read())

if __name__=='__main__':
    build_all()
