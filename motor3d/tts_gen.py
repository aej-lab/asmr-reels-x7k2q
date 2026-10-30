import sys, json, os
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

D = sys.argv[2].rstrip("/") + "/"
segs = json.load(open(sys.argv[1]))["segments"]
os.makedirs(D + "out", exist_ok=True)
k = Kokoro(D + "kokoro.onnx", D + "voices.bin")
SPEED = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
sr = 24000
out = []
meta = []
t = 0.35
out.append(np.zeros(int(sr * 0.35), dtype=np.float32))
for s in segs:
    a, _ = k.create(s, voice="af_nicole", speed=SPEED, lang="en-us")
    a = a.astype(np.float32)
    idx = np.where(np.abs(a) > 0.01)[0]
    a = a[idx[0]:idx[-1] + 1]
    env = np.convolve(np.abs(a), np.ones(240) / 240, mode="same")
    quiet = env < 0.012
    keep = np.ones(len(a), bool)
    i = 0
    n = len(a)
    minrun = int(sr * 0.15)
    cap = int(sr * 0.11)
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if j - i > minrun:
                keep[i + cap // 2:j - cap // 2] = False
            i = j
        else:
            i += 1
    a = a[keep]
    d = len(a) / sr
    meta.append({"text": s, "start": t, "end": t + d})
    out.append(a)
    gap = 0.22
    out.append(np.zeros(int(sr * gap), dtype=np.float32))
    t += d + gap
out.append(np.zeros(int(sr * 0.5), dtype=np.float32))
sf.write(D + "out/voice.wav", np.concatenate(out), sr)
json.dump({"segs": meta, "total": t + 0.5}, open(D + "out/timing.json", "w"), indent=1)
print(t + 0.5)
