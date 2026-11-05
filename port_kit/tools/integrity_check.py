#!/usr/bin/env python3
"""Prove that a redesign did not touch the science.

Mode 1, single file HTML dashboards:
  python integrity_check.py html --original old.html --built new.html [--ignore-id pl-explore ...] [--ignore-regex REGEX ...]
  Checks that every original <script> is present in the new file, byte for byte and in the same order, and that the
  static visible text is identical (after removing the layer's own elements and any live labels you list).

Mode 2, any project kept in git (React, Dash, Streamlit, Shiny, ...):
  python integrity_check.py git --base main --protect "src/calc/**" "data/**" "*.R"
  Fails if any protected path differs from the base ref. Protect every file that computes, fits, filters, rounds
  or loads data. Pass the globs that match your project.
Exit code 0 = unchanged, 1 = changed.
"""
import argparse, re, subprocess, sys
from html.parser import HTMLParser

class Text(HTMLParser):
    def __init__(self, ignore_ids):
        super().__init__(convert_charrefs=True)
        self.out, self.skip, self.stack, self.ignore = [], 0, [], set(ignore_ids)
    VOID = {'br', 'img', 'input', 'meta', 'link', 'hr', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'}
    def handle_starttag(self, tag, attrs):
        if tag in self.VOID:
            return
        skip = tag in ('script', 'style', 'noscript') or dict(attrs).get('id') in self.ignore
        self.stack.append(skip); self.skip += 1 if skip else 0
    def handle_endtag(self, tag):
        if tag in self.VOID or not self.stack:
            return
        if self.stack.pop():
            self.skip -= 1
    def handle_data(self, data):
        if not self.skip:
            self.out.append(data)

def visible_text(html, ignore_ids, ignore_regex):
    p = Text(ignore_ids); p.feed(html)
    t = re.sub(r'\s+', ' ', ' '.join(p.out)).strip()
    for rx in ignore_regex:
        t = re.sub(rx, '', t)
    return t

def scripts(html):
    return re.findall(r'<script[^>]*>(.*?)</script>', html, re.S)

def mode_html(a):
    o = open(a.original, encoding='utf8').read(); b = open(a.built, encoding='utf8').read()
    it = iter(scripts(b)); intact = all(any(x == y for y in it) for x in scripts(o))
    t1, t2 = visible_text(o, a.ignore_id, a.ignore_regex), visible_text(b, a.ignore_id, a.ignore_regex)
    same = t1 == t2
    print('PASS  original scripts intact and in order' if intact else 'FAIL  an original script changed or is missing')
    print('PASS  static visible text identical (%d characters)' % len(t1) if same else 'FAIL  static visible text differs')
    if not same:
        n = next((i for i, (x, y) in enumerate(zip(t1, t2)) if x != y), min(len(t1), len(t2)))
        print('      first difference near character %d:\n      original: %r\n      built:    %r' % (n, t1[max(0, n - 30):n + 40], t2[max(0, n - 30):n + 40]))
    print('NOTE  text produced by scripts at run time is checked by fidelity_test.py, not here')
    return 0 if intact and same else 1

def mode_git(a):
    r = subprocess.run(['git', 'diff', '--name-only', a.base, '--'] + a.protect, capture_output=True, text=True)
    if r.returncode != 0:
        print('git error:', r.stderr.strip()); return 2
    changed = [x for x in r.stdout.split('\n') if x]
    if changed:
        print('FAIL  protected files changed since %s:' % a.base)
        for c in changed: print('      ' + c)
        return 1
    print('PASS  no protected file changed since %s (%s)' % (a.base, ', '.join(a.protect)))
    return 0

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='mode', required=True)
    h = sub.add_parser('html'); h.add_argument('--original', required=True); h.add_argument('--built', required=True)
    h.add_argument('--ignore-id', action='append', default=[]); h.add_argument('--ignore-regex', action='append', default=[])
    g = sub.add_parser('git'); g.add_argument('--base', required=True); g.add_argument('--protect', nargs='+', required=True)
    a = ap.parse_args()
    return mode_html(a) if a.mode == 'html' else mode_git(a)

if __name__ == '__main__':
    sys.exit(main())
