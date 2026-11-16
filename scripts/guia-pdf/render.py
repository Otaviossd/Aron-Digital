# -*- coding: utf-8 -*-
"""Imprime un HTML (string) a PDF usando Chromium (Playwright), en A4."""
import asyncio
from playwright.async_api import async_playwright


async def _render(html, out_path):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        await pg.set_content(html, wait_until="networkidle")
        await pg.emulate_media(media="print")
        await pg.pdf(path=out_path, width="210mm", height="297mm", print_background=True, margin={"top": "0", "bottom": "0", "left": "0", "right": "0"})
        await b.close()


def render_pdf(html, out_path):
    asyncio.run(_render(html, out_path))
