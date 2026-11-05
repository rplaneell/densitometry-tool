#!/usr/bin/env python3
"""Check that what the interactive layer PLOTS equals what the dashboard COMPUTED, exactly, before and after every setting change.

Usage:  python fidelity_test.py config.json [--browser-path /path/to/chrome]

The config (JSON) lists:
  url            page address, or a path to a local html file (relative to the config)
  steps          actions that load the tool's own example data (select, click, fill, wait ...)
  checks         [{ "name": "...", "plotted_js": "<js expression returning an array>", "truth_js": "<js expression returning an array>",
                    "sort": "asc" | "desc" | "none" }]
  setting_changes  a list of action lists; after each list every check is run again
Exact equality is required (no tolerance). Never use invented data: use the tool's example data or a file you were given.
Exit code 0 = all checks equal, 1 = a mismatch.
See configs/fidelity.example.json for a working example.
"""
import argparse, json, sys
from playwright.sync_api import sync_playwright
from _common import load_config, resolve_url, launch, run_steps, note

def ordered(v, how):
    if how in ('asc', 'desc') and isinstance(v, list):
        return sorted(v, reverse=(how == 'desc'), key=lambda x: json.dumps(x))
    return v

def run_checks(page, checks, label):
    ok_all = True
    for c in checks:
        plotted = page.evaluate('() => (' + c['plotted_js'] + ')')
        truth = page.evaluate('() => (' + c['truth_js'] + ')')
        how = c.get('sort', 'none')
        same = json.dumps(ordered(plotted, how)) == json.dumps(ordered(truth, how))
        n = len(plotted) if isinstance(plotted, list) else 1
        ok_all &= note(same, '%s | %s | %d values' % (label, c['name'], n))
        if not same:
            print('      plotted:', json.dumps(plotted)[:300]); print('      truth:  ', json.dumps(truth)[:300])
    return ok_all

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('config'); ap.add_argument('--browser-path')
    a = ap.parse_args(); cfg = load_config(a.config)
    ok = True
    with sync_playwright() as p:
        b = launch(p, a.browser_path)
        page = b.new_page(viewport=cfg.get('viewport', {'width': 1600, 'height': 1000}))
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(resolve_url(cfg['url'], a.config)); page.wait_for_timeout(1200)
        run_steps(page, cfg.get('steps')); page.wait_for_timeout(int(cfg.get('settle_ms', 1500)))
        ok &= run_checks(page, cfg['checks'], 'start')
        for i, group in enumerate(cfg.get('setting_changes', []), 1):
            run_steps(page, group); page.wait_for_timeout(400)
            ok &= run_checks(page, cfg['checks'], 'after change %d' % i)
        ok &= note(not errors, 'no page errors' + ('' if not errors else ': ' + '; '.join(errors)[:200]))
        b.close()
    print('\nRESULT:', 'ALL EQUAL' if ok else 'MISMATCH FOUND')
    return 0 if ok else 1

if __name__ == '__main__':
    sys.exit(main())
