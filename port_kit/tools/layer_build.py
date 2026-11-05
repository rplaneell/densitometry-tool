#!/usr/bin/env python3
"""Add a design layer (CSS, JS, an inlined chart library) to a SINGLE FILE HTML dashboard without touching its own scripts.

Usage:  python layer_build.py config.json

What it does
  1. Reads the original HTML.
  2. Recolours only the page's own <style> blocks: each legacy hex colour becomes a colour token (var(--x)), except
     inside the :root block, where it becomes the literal new value. Data URI icons get literal colours.
  3. Adds CSS attribute overrides so colours drawn as SVG attributes (fill="#...") also follow the tokens.
  4. Injects your CSS before </head> and your JS (and optional libraries, kept unmodified with a banner) before </body>.
  5. Proves that every original <script> is still present, byte for byte and in order.
Nothing in the original scripts is edited. If the check fails the file is still written but the exit code is 1.

Config (JSON), all paths relative to the config file:
{
  "original": "dashboard.html",
  "output": "dashboard_new.html",
  "calm_by_default": true,                 // adds class pq-calm early if your page has such a mode, else set false
  "calm_class": "pq-calm",
  "hex_to_token":  {"06038E": "--primary"},          // legacy colour (no #) to token name
  "token_literals": {"--primary": "0A2463"},         // new literal value used inside :root and in data URIs
  "rgba_map": [["6,3,142", "10,36,99"]],             // legacy r,g,b to new r,g,b inside rgba(...)
  "css": ["layer/theme_and_structure.css", "layer/explorer.css", "layer/customize_panel.css"],
  "js_libs": [{"path": "vendor/echarts.min.js", "banner": "Apache ECharts 5.5.1, Apache License 2.0, inlined unmodified"}],
  "js": ["layer/usability.js", "layer/explorer.js", "layer/customize_panel.js"]
}
"""
import json, os, re, sys

def recolor(css, cfg):
    tokens = {k.upper(): v for k, v in cfg.get('hex_to_token', {}).items()}
    lit = {k: v.lstrip('#').upper() for k, v in cfg.get('token_literals', {}).items()}
    rgba = cfg.get('rgba_map', [])

    def literal(txt):
        for hx, tok in tokens.items():
            val = lit.get(tok)
            if val:
                txt = re.sub('(?<![0-9A-Za-z%])#' + hx + r'\b', '#' + val, txt, flags=re.I)
                txt = txt.replace('%23' + hx, '%23' + val).replace('%23' + hx.lower(), '%23' + val)
        return rgba_fix(txt)

    def rgba_fix(txt):
        for a, b in rgba:
            txt = re.sub(r'rgba\(\s*' + a.replace(',', r'\s*,\s*') + r'\s*,', 'rgba(' + b + ',', txt)
        return txt

    def variables(txt):
        for hx, tok in tokens.items():
            txt = re.sub('(?<![0-9A-Za-z%])#' + hx + r'\b', 'var(' + tok + ')', txt, flags=re.I)
            val = lit.get(tok)
            if val:
                txt = txt.replace('%23' + hx, '%23' + val).replace('%23' + hx.lower(), '%23' + val)
        return rgba_fix(txt)

    i = css.find(':root{'); j = css.find('}', i) if i >= 0 else -1
    if i >= 0 and j > i:
        return literal(css[:i + 6]) + literal(css[i + 6:j]) + variables(css[j:])
    return variables(css)

def svg_overrides(cfg):
    out = []
    for hx, tok in cfg.get('hex_to_token', {}).items():
        for att in ('fill', 'stroke', 'stop-color'):
            out.append('svg [%s="#%s" i]{%s:var(%s)}' % (att, hx, att, tok))
    return '\n'.join(out) + '\n'

def scripts(html):
    return re.findall(r'<script[^>]*>(.*?)</script>', html, re.S)

def main():
    if len(sys.argv) != 2:
        print(__doc__); return 2
    cfg_path = os.path.abspath(sys.argv[1]); base = os.path.dirname(cfg_path)
    cfg = json.load(open(cfg_path, encoding='utf8'))
    rd = lambda p: open(os.path.join(base, p), encoding='utf8').read()
    original = rd(cfg['original'])
    page = re.sub(r'<style>(.*?)</style>', lambda m: '<style>' + recolor(m.group(1), cfg) + '</style>', original, flags=re.S)
    early = ''
    if cfg.get('calm_by_default'):
        early = "<script>try{document.documentElement.classList.add('%s')}catch(e){}</script>\n" % cfg.get('calm_class', 'pq-calm')
    style_block = '<style>\n/*LAYER colours mapped to tokens*/\n' + svg_overrides(cfg) + ''.join(rd(p) + '\n' for p in cfg.get('css', [])) + '</style>\n' + early
    script_block = ''
    for lib in cfg.get('js_libs', []):
        script_block += '<script>\n/* %s */\n%s\n</script>\n' % (lib.get('banner', lib['path']), rd(lib['path']))
    for p in cfg.get('js', []):
        script_block += '<script>\n%s\n</script>\n' % rd(p)
    if page.count('</head>') != 1 or page.count('</body>') != 1:
        print('ERROR: expected exactly one </head> and one </body>'); return 1
    built = page.replace('</head>', style_block + '</head>').replace('</body>', script_block + '</body>')
    out_path = os.path.join(base, cfg['output'])
    open(out_path, 'w', encoding='utf8').write(built)
    it = iter(scripts(built))
    intact = all(any(o == b for b in it) for o in scripts(original))
    print('wrote %s (%d bytes)' % (out_path, len(built.encode('utf8'))))
    print('original scripts intact and in order:', intact)
    return 0 if intact else 1

if __name__ == '__main__':
    sys.exit(main())
