"""Voz del Reel (Kokoro, af_nicole) · v2 (2026-11-08): locución más natural.

Uso: python3 tts_gen.py script.json WORKDIR [velocidad_base=0.97]

script.json = {"segments": [...frases tal como se ven en los subtítulos...],
               "voice":    [...opcional, misma longitud: texto alternativo SOLO para la voz
                             (grafías de pronunciación); null o "" = usar el de segments...]}

Qué cambia respecto a la v1 (que sonaba a robot):
- Velocidad base 0,97 (antes 1,06-1,15, demasiado rápida y plana).
- Cada frase ajusta su velocidad según su forma: las cortas y las preguntas van algo más
  lentas (énfasis), las largas algo más ágiles. Así el ritmo ya no es un metrónomo.
- Se respetan las pausas naturales de la voz (comas, guiones). Antes se aplastaba
  cualquier silencio > 0,15 s a 0,11 s; ahora solo se recorta lo que pasa de 0,45 s.
- La pausa entre frases depende de cómo acaba la frase (punto, pregunta, coma, exclamación)
  y tiene una pequeña variación fija (determinista) para no sonar mecánica.
- Fundidos de 8 ms en los bordes de cada frase (sin clics).
"""
import sys, json, os, re
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

W = sys.argv[2].rstrip("/") + "/"
data = json.load(open(sys.argv[1]))
segs = data["segments"]
voz = data.get("voice") or [None] * len(segs)
assert len(voz) == len(segs), "'voice' debe tener la misma longitud que 'segments'"
BASE = float(sys.argv[3]) if len(sys.argv) > 3 else 0.97
VOICE = "af_nicole"
sr = 24000
os.makedirs(W + "out", exist_ok=True)
k = Kokoro(W + "kokoro.onnx", W + "voices.bin")


def seg_speed(txt):
    """Velocidad de la frase según su forma (la ortografía de los subtítulos manda)."""
    n = len(re.findall(r"[A-Za-z0-9']+", txt))
    v = BASE
    if txt.rstrip().endswith("?"):
        v *= 0.97          # pregunta: más pausada, con entonación
    if n <= 6:
        v *= 0.95          # frase corta = golpe de efecto, se dice con peso
    elif n >= 15:
        v *= 1.03          # frase larga: algo más ágil para no arrastrarla
    return min(max(v, 0.85), 1.15)


def gap_after(txt, i, last):
    """Pausa tras la frase (s) según cómo termina; pequeña variación determinista."""
    t = txt.rstrip()
    end = t[-1] if t else "."
    base = {".": 0.34, "?": 0.44, "!": 0.30, ",": 0.16, ":": 0.22, ";": 0.20}.get(end, 0.30)
    wiggle = (-0.03, 0.02, 0.0, 0.03, -0.01)[i % 5]
    return 0.7 if last else max(0.12, base + wiggle)


def trim(a):
    idx = np.where(np.abs(a) > 0.01)[0]
    pad = int(sr * 0.03)
    return a[max(idx[0] - pad, 0): idx[-1] + 1 + pad]


def shorten_long_silences(a):
    """Solo recorta silencios largos (> 0,45 s) a 0,30 s. Las pausas naturales no se tocan."""
    env = np.convolve(np.abs(a), np.ones(240) / 240, mode="same")
    quiet = env < 0.010
    keep = np.ones(len(a), bool)
    minrun, cap = int(sr * 0.45), int(sr * 0.30)
    i, n = 0, len(a)
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if j - i > minrun:
                keep[i + cap // 2: j - cap // 2] = False
            i = j
        else:
            i += 1
    return a[keep]


def fade(a, ms=8):
    f = int(sr * ms / 1000)
    a = a.copy()
    a[:f] *= np.linspace(0, 1, f)
    a[-f:] *= np.linspace(1, 0, f)
    return a


out, meta = [], []
t = 0.35
out.append(np.zeros(int(sr * 0.35), dtype=np.float32))
for i, s in enumerate(segs):
    spoken = voz[i] if voz[i] else s
    a, _ = k.create(spoken, voice=VOICE, speed=seg_speed(s), lang="en-us")
    a = fade(shorten_long_silences(trim(a.astype(np.float32))))
    d = len(a) / sr
    meta.append({"text": s, "start": t, "end": t + d})
    out.append(a)
    gap = gap_after(s, i, i == len(segs) - 1)
    out.append(np.zeros(int(sr * gap), dtype=np.float32))
    t += d + gap

sf.write(W + "out/voice.wav", np.concatenate(out), sr)
json.dump({"segs": meta, "total": t}, open(W + "out/timing.json", "w"), indent=1)
print(round(t, 2))
