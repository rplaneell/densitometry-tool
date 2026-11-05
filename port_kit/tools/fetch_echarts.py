#!/usr/bin/env python3
"""Download the pinned Apache ECharts build into ../vendor/ and verify its checksum.
Usage: python fetch_echarts.py
A page with a strict content security policy cannot load libraries from the internet, so layer_build.py pastes this file inline."""
import hashlib, os, sys, urllib.request
URL = 'https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js'
LIC = 'https://cdn.jsdelivr.net/npm/echarts@5.5.1/LICENSE'
SHA = 'e84270bd0cd5bdf60fefc26d00c2a391cb2e81f4d26a7a9ee16185a54773a3cf'
here = os.path.dirname(os.path.abspath(__file__)); out = os.path.join(here, '..', 'vendor'); os.makedirs(out, exist_ok=True)
data = urllib.request.urlopen(URL, timeout=60).read()
got = hashlib.sha256(data).hexdigest()
if got != SHA:
    print('CHECKSUM MISMATCH: expected', SHA, 'got', got); sys.exit(1)
open(os.path.join(out, 'echarts.min.js'), 'wb').write(data)
open(os.path.join(out, 'ECHARTS_LICENSE_Apache2.txt'), 'wb').write(urllib.request.urlopen(LIC, timeout=60).read())
print('ok: echarts 5.5.1 saved to', os.path.abspath(out), '(Apache License 2.0)')
