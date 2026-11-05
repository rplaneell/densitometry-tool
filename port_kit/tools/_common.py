"""Shared helpers for the browser tools (Playwright for Python)."""
import json, os, sys

def load_config(path):
    return json.load(open(path, encoding='utf8'))

def resolve_url(url, config_path):
    if '://' in url:
        return url
    return 'file://' + os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(config_path)), url))

def launch(p, browser_path=None):
    kw = {'headless': True}
    if browser_path:
        kw['executable_path'] = browser_path
    return p.chromium.launch(**kw)

def run_steps(page, steps):
    """Each step is one small dict: select, click, fill, check, uncheck, press, wait, scroll_to, set_files, eval."""
    for s in steps or []:
        if 'select' in s:
            page.select_option(s['select'], s['value'])
        elif 'click' in s:
            page.click(s['click'])
        elif 'fill' in s:
            page.fill(s['fill'], str(s['value']))
            if s.get('dispatch'):
                page.dispatch_event(s['fill'], s['dispatch'])
        elif 'check' in s:
            page.check(s['check'])
        elif 'uncheck' in s:
            page.uncheck(s['uncheck'])
        elif 'press' in s:
            page.keyboard.press(s['press'])
        elif 'scroll_to' in s:
            page.evaluate("sel => document.querySelector(sel).scrollIntoView({block:'center'})", s['scroll_to'])
        elif 'set_files' in s:
            page.set_input_files(s['set_files'], s['path'])
        elif 'eval' in s:
            page.evaluate(s['eval'])
        elif 'wait' in s:
            page.wait_for_timeout(int(s['wait']))
        else:
            raise ValueError('unknown step: %r' % (s,))
        page.wait_for_timeout(int(s.get('then_wait', 250)))

def note(ok, text):
    print(('PASS  ' if ok else 'FAIL  ') + text)
    return ok
