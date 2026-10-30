#!/usr/bin/env python3
"""Portada 1080x1920 SIN subtítulos: python3 cover3d.py <workdir> "LINEA 1" "LINEA 2" ["LINEA 3"]
Antes: python3 render3d.py <workdir> cover <t> (fotograma limpio en out/cover_bg.jpg). Texto centrado, zona 700-1200, sin tocar el borde inferior."""
import sys, os
from PIL import Image, ImageDraw, ImageFont
W = os.path.abspath(sys.argv[1]) + "/"; lines = [l.upper() for l in sys.argv[2:]]
im = Image.open(W + "out/cover_bg.jpg").convert("RGB").resize((1080, 1920), Image.LANCZOS)
row = im.crop((0, 1900, 1080, 1901)).resize((1080, 20)); im.paste(row, (0, 1900))   # borra la barra de progreso
d = ImageDraw.Draw(im, "RGBA"); size = 92
f = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-SemiBold.otf", size)
while max(d.textlength(l, font=f) for l in lines) > 880 and size > 50:
    size -= 4; f = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-SemiBold.otf", size)
lh = int(size * 1.5); y0 = 960 - lh * len(lines) // 2
for i, l in enumerate(lines):
    w = d.textlength(l, font=f); x = (1080 - w) / 2; y = y0 + i * lh
    d.rectangle([x - 24, y - 6, x + w + 24, y + size + 30], fill=(0, 0, 0, 140)); d.text((x, y), l, font=f, fill="white")
im.save(W + "out/cover.jpg", quality=92); print("out/cover.jpg", os.path.getsize(W + "out/cover.jpg"))
