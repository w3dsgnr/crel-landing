#!/usr/bin/env python3
"""Full-page screenshots of both landing states for design review.
Usage: python3 scripts/shoot.py <out_dir> [base_url]
Captures /services and /platform full-page at desktop width.
Emulates reduced-motion so mockup animations settle to final state (stable shots).
"""
import sys, time
from playwright.sync_api import sync_playwright

out = sys.argv[1] if len(sys.argv) > 1 else "docs/review/tmp"
base = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:3000"
pages = {"services": "/services", "platform": "/platform"}

# hide Next dev-indicator (dev server only; disabled in prod via next.config)
HIDE = "nextjs-portal, [data-nextjs-toast], #__next-build-watcher { display:none !important; }"

import os
os.makedirs(out, exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1440, "height": 900},
                        device_scale_factor=2,
                        reduced_motion="reduce")
    for name, path in pages.items():
        pg = ctx.new_page()
        pg.goto(base + path, wait_until="networkidle")
        pg.add_style_tag(content=HIDE)
        time.sleep(1.2)  # let reveal/typewriter settle
        # scroll through to trigger any IO-gated reveals, then back to top
        h = pg.evaluate("document.body.scrollHeight")
        for y in range(0, h, 700):
            pg.evaluate(f"window.scrollTo(0,{y})"); time.sleep(0.12)
        pg.evaluate("window.scrollTo(0,0)"); time.sleep(0.5)
        f = f"{out}/{name}.png"
        pg.screenshot(path=f, full_page=True)
        print("wrote", f)
        pg.close()
    b.close()
