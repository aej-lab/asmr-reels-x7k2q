#!/usr/bin/env python3
"""QA visual: python3 qa3d.py <workdir>  -> out/qa_sheet_N.jpg (hoja de contacto de 1 fotograma cada 0,5 s de out/video_raw.mp4) + comprobaciones.
Después MIRA cada hoja con Read: solapes, cortes, marca de agua integrada (2 apariciones), huecos, transiciones, bucle final->inicio."""
import sys, os, subprocess, json
W = os.path.abspath(sys.argv[1]) + "/"; O = W + "out/"
src = O + "video_raw.mp4" if os.path.exists(O + "video_raw.mp4") else O + "final.mp4"
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]))
wh = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height", "-of", "csv=p=0", src]).decode().strip()
print("duración", round(dur, 2), "tamaño", wh)
assert os.environ.get("QA_NOASSERT") or 25 <= dur <= 41, "FALLO: duración fuera de 25-40 s"
k = 0
for i in range(0, int(dur * 2), 21):
    k += 1
    subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-ss", str(i / 2), "-i", src, "-vf", "fps=2,scale=300:-1,tile=7x3", "-frames:v", "1", "-t", "10.5", O + "qa_sheet_%d.jpg" % k])
print("hojas:", k, "-> léelas con Read")
