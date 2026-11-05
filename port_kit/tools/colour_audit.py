#!/usr/bin/env python3
"""Find every colour used in a dashboard and suggest which palette token each one should become.

Usage:
  python colour_audit.py PATH [PATH ...] [--palette palette.json] [--json out.json]

PATH is a file or a folder (html, css, js, jsx, ts, tsx, py, svg, vue, svelte are scanned;
node_modules, .git, dist, build and virtual environments are skipped; base64 blobs are ignored).
palette.json maps token names to hex values, for example:
  {"--primary": "#0A2463", "--secondary": "#1B6CA8", "--accent": "#00E5A0", "--warn": "#C25E00"}
With a palette the report suggests the nearest token for each legacy colour. This only reads files.
"""
import argparse, json, os, re, sys
from collections import Counter

EXT = {'.html', '.htm', '.css', '.scss', '.js', '.jsx', '.ts', '.tsx', '.py', '.svg', '.vue', '.svelte', '.md'}
SKIP = {'node_modules', '.git', 'dist', 'build', '__pycache__', '.venv', 'venv', '.next', '.cache'}
HEX = re.compile(r'(?<![0-9A-Za-z&])#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b')
RGB = re.compile(r'rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})')
B64 = re.compile(r'data:[a-z/+\-]+;base64,[A-Za-z0-9+/=]{200,}')

def norm(h):
    h = h.upper()
    return h if len(h) == 6 else ''.join(c * 2 for c in h)

def to_rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def dist(a, b):
    # weighted distance, closer to how the eye sees colour differences
    rm = (a[0] + b[0]) / 2
    dr, dg, db = a[0] - b[0], a[1] - b[1], a[2] - b[2]
    return ((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db) ** .5

def files(paths):
    for p in paths:
        if os.path.isfile(p):
            yield p
        else:
            for root, dirs, names in os.walk(p):
                dirs[:] = [d for d in dirs if d not in SKIP]
                for n in names:
                    if os.path.splitext(n)[1].lower() in EXT:
                        yield os.path.join(root, n)

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('paths', nargs='+'); ap.add_argument('--palette'); ap.add_argument('--json')
    a = ap.parse_args()
    counts, where = Counter(), {}
    for f in files(a.paths):
        try:
            text = B64.sub('', open(f, encoding='utf8', errors='ignore').read())
        except OSError:
            continue
        found = [norm(m.group(1)) for m in HEX.finditer(text)]
        found += ['%02X%02X%02X' % tuple(min(255, int(x)) for x in m.groups()) for m in RGB.finditer(text)]
        for c in found:
            counts[c] += 1
            where.setdefault(c, set()).add(os.path.relpath(f))
    pal = {}
    if a.palette:
        pal = {k: norm(v.lstrip('#')) for k, v in json.load(open(a.palette)).items()}
    rows = []
    for c, n in counts.most_common():
        row = {'hex': '#' + c, 'uses': n, 'files': sorted(where[c])[:5]}
        if pal:
            tok = min(pal, key=lambda t: dist(to_rgb(c), to_rgb(pal[t])))
            row['suggest'] = tok; row['distance'] = round(dist(to_rgb(c), to_rgb(pal[tok])), 1)
        rows.append(row)
    print('%d distinct colours, %d uses' % (len(rows), sum(counts.values())))
    for r in rows:
        print('%-9s x%-4d %s%s' % (r['hex'], r['uses'], r['files'][0] if r['files'] else '', ('  ->  ' + r['suggest']) if 'suggest' in r else ''))
    if a.json:
        json.dump(rows, open(a.json, 'w'), indent=2); print('wrote', a.json)

if __name__ == '__main__':
    sys.exit(main())
