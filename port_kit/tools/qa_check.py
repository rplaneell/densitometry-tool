#!/usr/bin/env python3
"""Quality checks in a real browser: phone width, errors, motion, contrast, keyboard, print.

Usage:  python qa_check.py config.json [--browser-path /path/to/chrome]

Checks (each can be tuned or switched off in the config):
  phone width has no sideways scroll          "phone_width": 390
  no console errors or page errors
  endless animations when reduced motion is requested must be 0
  endless animations in the default state must be at most "max_endless_default" (0 for a calm dashboard)
  text contrast ratio of listed selectors     "contrast": {"name": ["css selector", 4.5]}
  keyboard: first Tab stop is a visible, named control
  print: listed layer selectors are hidden    "print_hidden": ["#panel"]
See configs/qa.example.json. Exit code 0 = all pass, 1 = at least one failure.
"""
import argparse, sys
from playwright.sync_api import sync_playwright
from _common import load_config, resolve_url, launch, run_steps, note

LUM = """c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4) };
  return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]) }"""

COLOURS = """sel => { const e = document.querySelector(sel); if (!e) return null;
  const P = x => x.match(/[\\d.]+/g).slice(0, 3).map(Number); let bg = null, n = e;
  while (n) { const b = getComputedStyle(n).backgroundColor, m = b.match(/[\\d.]+/g);
    if (m && (m.length < 4 || +m[3] > .5)) { bg = P(b); break } n = n.parentElement }
  return { fg: P(getComputedStyle(e).color), bg: bg || [255, 255, 255] } }"""

ENDLESS = "() => document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.getTiming().iterations === Infinity).length"

def ratio(page, fg, bg):
    l1 = page.evaluate('(' + LUM + ')', fg); l2 = page.evaluate('(' + LUM + ')', bg)
    return (max(l1, l2) + .05) / (min(l1, l2) + .05)

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('config'); ap.add_argument('--browser-path')
    a = ap.parse_args(); cfg = load_config(a.config); url = resolve_url(cfg['url'], a.config)
    ok = True
    with sync_playwright() as p:
        b = launch(p, a.browser_path)
        # phone width and errors
        ctx = b.new_context(viewport={'width': cfg.get('phone_width', 390), 'height': 800}); pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text[:100]) if m.type == 'error' else None)
        pg.goto(url); pg.wait_for_timeout(1500); run_steps(pg, cfg.get('steps'))
        over = pg.evaluate('document.documentElement.scrollWidth - innerWidth')
        ok &= note(over <= 0, 'phone width: sideways overflow %d px' % over)
        ok &= note(not errs, 'no console or page errors' + ('' if not errs else ': ' + '; '.join(errs)[:200]))
        ctx.close()
        # reduced motion
        ctx = b.new_context(viewport={'width': 1360, 'height': 900}, reduced_motion='reduce'); pg = ctx.new_page(); pg.goto(url); pg.wait_for_timeout(1200)
        n = pg.evaluate(ENDLESS); ok &= note(n == 0, 'reduced motion: %d endless animations running (must be 0)' % n); ctx.close()
        # default motion, contrast, keyboard
        ctx = b.new_context(viewport={'width': 1360, 'height': 900}); pg = ctx.new_page(); pg.goto(url); pg.wait_for_timeout(1200)
        n = pg.evaluate(ENDLESS); mx = cfg.get('max_endless_default', 0)
        ok &= note(n <= mx, 'default state: %d endless animations (allowed %d)' % (n, mx))
        for name, (sel, minimum) in cfg.get('contrast', {}).items():
            c = pg.evaluate(COLOURS, sel)
            if not c:
                ok &= note(False, 'contrast %s: selector %s not found' % (name, sel)); continue
            r = ratio(pg, c['fg'], c['bg']); ok &= note(r >= minimum, 'contrast %s: %.1f (needs %.1f)' % (name, r, minimum))
        pg.keyboard.press('Tab'); pg.wait_for_timeout(200)
        info = pg.evaluate("() => { const e = document.activeElement; const cs = getComputedStyle(e); return {name: (e.id || e.getAttribute('aria-label') || e.textContent.trim().slice(0, 30)), outline: cs.outlineStyle + ' ' + cs.outlineWidth} }")
        ok &= note(bool(info['name']) and 'none' not in info['outline'], 'keyboard: first Tab stop "%s" with outline %s' % (info['name'], info['outline']))
        ctx.close()
        # print
        if cfg.get('print_hidden'):
            ctx = b.new_context(viewport={'width': 1360, 'height': 900}); pg = ctx.new_page(); pg.goto(url); run_steps(pg, cfg.get('steps')); pg.emulate_media(media='print')
            for sel in cfg['print_hidden']:
                d = pg.evaluate("s => { const e = document.querySelector(s); return e ? getComputedStyle(e).display : 'missing' }", sel)
                ok &= note(d in ('none', 'missing'), 'print hides %s (display: %s)' % (sel, d))
            ctx.close()
        b.close()
    print('\nRESULT:', 'ALL PASS' if ok else 'FAILURES FOUND')
    return 0 if ok else 1

if __name__ == '__main__':
    sys.exit(main())
