#!/usr/bin/env python3
"""Render 3D en Chromium (WebGL por software). Uso:
  python3 render3d.py <workdir> preview [t1 t2 ...]   -> out/pNN.jpg (por defecto 2 fotogramas por escena)
  python3 render3d.py <workdir> full [--workers N] [--sc 2]  -> out/video_raw.mp4 (sin audio)
  python3 render3d.py <workdir> cover <t>              -> out/cover_bg.jpg (fotograma SIN subtítulos)
<workdir> contiene scenes.js (define BUILD y TRANS), out/timing.json. SC=2 -> 1440x2560 (2K); SC=1.5 -> 1080x1920.
El render va por trozos de 90 fotogramas (out/parts/part_XXX.mp4): si se corta, relanzar el mismo comando REANUDA.
--workers N lanza N procesos en paralelo (usa N = nº de núcleos)."""
import json, sys, subprocess, os, glob, time
from playwright.sync_api import sync_playwright
M = os.path.dirname(os.path.abspath(__file__)) + "/"
W = os.path.abspath(sys.argv[1]) + "/"; O = W + "out/"; mode = sys.argv[2]
args = sys.argv[3:]
def opt(name, default):
    return args[args.index(name) + 1] if name in args else default
SC = float(opt("--sc", "2")); workers = int(opt("--workers", "1"))
CH = 90; FPS = 30
T = open(O + "timing.json").read(); tm = json.loads(T); n = int(tm["total"] * FPS)
def page_html():
    js = ("window.SC=%s;\n" % SC + open(M + "vendor/three.min.js").read() + "\n" + open(M + "engine.js").read().replace("__TIMING__", T) + "\n"
          + open(M + "lib3d.js").read() + "\n" + open(W + "scenes.js").read() + "\nwindow.ready=true;")
    open(O + "scene3d.html", "w").write('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#05060a}canvas{display:block;width:720px;height:1280px}</style></head><body><canvas id="c"></canvas><script>' + js + '</script></body></html>')
def open_page(p):
    b = p.chromium.launch(args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    pg = b.new_page(viewport={"width": 720, "height": 1280}, device_scale_factor=SC)
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.goto("file://" + O + "scene3d.html"); pg.wait_for_function("window.ready===true", timeout=60000); pg.evaluate("document.fonts.ready")
    return b, pg, errs
def do_chunks(ids):
    os.makedirs(O + "parts", exist_ok=True)
    with sync_playwright() as p:
        b, pg, errs = open_page(p)
        for c in ids:
            out = O + "parts/part_%03d.mp4" % c
            if os.path.exists(out): continue
            f0, f1 = c * CH, min(n, (c + 1) * CH)
            ff = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(FPS), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "veryfast", out + ".tmp.mp4"], stdin=subprocess.PIPE)
            for f in range(f0, f1):
                pg.evaluate("render(%f)" % (f / FPS)); ff.stdin.write(pg.screenshot(type="jpeg", quality=92))
            ff.stdin.close()
            if ff.wait() == 0: os.rename(out + ".tmp.mp4", out)
            print("chunk", c, "ok", flush=True)
        b.close()
        if errs: print("ERRORES JS:", errs[:5])
page_html()
if mode in ("preview", "cover"):
    with sync_playwright() as p:
        b, pg, errs = open_page(p)
        times = [float(x) for x in args if not x.startswith("--")]
        if mode == "cover":
            pg.evaluate("window.subs=function(){}")
        if not times and mode == "preview":
            for s in tm["segs"]: times += [s["start"] + 0.15, s["start"] + (s["end"] - s["start"]) * .75]
        for i, t in enumerate(times):
            pg.evaluate("render(%f)" % t)
            pg.screenshot(path=O + ("cover_bg.jpg" if mode == "cover" else "p%02d.jpg" % i), type="jpeg", quality=90)
        print(errs, len(times)); b.close()
elif mode in ("full", "chunks"):
    nch = (n + CH - 1) // CH
    if workers > 1:
        procs = [subprocess.Popen([sys.executable, M + "render3d.py", W, "chunks", "--sc", str(SC), "--ids", ",".join(str(c) for c in range(w, nch, workers))]) for w in range(workers)]
        [pr.wait() for pr in procs]
    elif "--ids" in args: do_chunks([int(x) for x in opt("--ids", "").split(",")])
    else: do_chunks(range(nch))
    if mode == "full":
        miss = [c for c in range(nch) if not os.path.exists(O + "parts/part_%03d.mp4" % c)]
        if miss: print("FALTAN trozos:", miss, "-> relanza el mismo comando"); sys.exit(2)
        open(O + "parts.txt", "w").write("".join("file 'parts/part_%03d.mp4'\n" % c for c in range(nch)))
        subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", O + "parts.txt", "-c", "copy", O + "video_raw.mp4"]); print("OK video_raw.mp4", n, "frames")
