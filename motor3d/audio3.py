#!/usr/bin/env python3
"""Audio genérico: python3 audio3.py <workdir>   (usa out/timing.json, out/voice.wav y, opcional, audio_events.json)
audio_events.json = lista de {"scene":i,"t":seg_desde_inicio_escena,"kind":...,"gain":..,"pan":..,...}
kinds: ping{f,dur} | whoosh{dur} | revwhoosh{dur} | rumble{dur} | swell{dur} | shimmer{dur} | chime{f} | glass{dur}
Todas las escenas llevan un whoosh de transición automático. Sin música (solo pad suave + aire)."""
import json, os, sys, numpy as np, soundfile as sf
from scipy.signal import resample_poly, butter, sosfilt
W = os.path.abspath(sys.argv[1]) + "/"; D = W + "out/"
sr = 44100
tm = json.load(open(D + "timing.json")); segs = tm["segs"]; total = tm["total"]; N = len(segs)
st = [s["start"] - 0.1 for s in segs]; en = [st[i + 1] if i < N - 1 else total for i in range(N)]
n = int(total * sr) + 1; t = np.arange(n) / sr
rng = np.random.default_rng(11); L = np.zeros(n); R = np.zeros(n)
ev = json.load(open(W + "audio_events.json")) if os.path.exists(W + "audio_events.json") else []
lp = lambda x, fc, o=2: sosfilt(butter(o, fc, "low", fs=sr, output="sos"), x)
hp = lambda x, fc, o=2: sosfilt(butter(o, fc, "high", fs=sr, output="sos"), x)
def add(sig, t0, gain=1.0, pan=0.0):
    i0 = int(t0 * sr)
    if i0 >= n or i0 + len(sig) <= 0: return
    a = max(0, -i0); b = min(len(sig), n - i0); seg = sig[a:b] * gain
    L[i0 + a:i0 + b] += seg * np.cos((pan + 1) * np.pi / 4) * 1.0
    R[i0 + a:i0 + b] += seg * np.sin((pan + 1) * np.pi / 4) * 1.0
def env_ad(m, att, dec):
    e = np.ones(m); a = int(att * sr); d = int(dec * sr)
    if a > 0: e[:a] = np.linspace(0, 1, a)
    if d > 0: e[-d:] *= np.linspace(1, 0, d)
    return e
def ping(f, dur, att=.004):
    m = int(dur * sr); tt = np.arange(m) / sr
    return np.sin(2 * np.pi * f * tt) * np.exp(-tt * (5 / dur)) * np.minimum(1, tt / att)
def whoosh(dur, rev=False):
    m = int(dur * sr); w = rng.standard_normal(m); lo = lp(w, 500); mid = lp(w, 2200); hi = hp(w, 2200) * .5
    p = np.linspace(0, 1, m); p = p[::-1] if rev else p
    sig = lo * (1 - p) + mid * p * .8 + hi * p * .5
    return sig / (np.abs(sig).max() + 1e-9) * np.sin(np.linspace(0, np.pi, m)) ** 2
fade = np.minimum(1, np.minimum(t / .5, (total - t) / .6))
for k, (f, a) in enumerate([(110.0, .5), (164.81, .35), (220.0, .3), (329.63, .12)]):
    lfo = .55 + .45 * np.sin(2 * np.pi * (.045 + .01 * k) * t + k)
    L += np.sin(2 * np.pi * f * t + k) * lfo * a * .05 * fade; R += np.sin(2 * np.pi * f * 1.003 * t + 2 * k) * lfo * a * .05 * fade
air = lp(rng.standard_normal(n), 900) * (.6 + .4 * np.sin(2 * np.pi * .07 * t)); air2 = lp(rng.standard_normal(n), 900) * (.6 + .4 * np.sin(2 * np.pi * .06 * t + 1))
L += air * .02 * fade; R += air2 * .02 * fade
for i in range(1, N): add(whoosh(.55), st[i] - .1, .10)
add(whoosh(.7), st[0] + .05, .05)
for e in ev:
    i = int(e["scene"]); t0 = st[i] + float(e.get("t", 0)); g = float(e.get("gain", .03)); pan = float(e.get("pan", 0)); k = e["kind"]
    dur = float(e.get("dur", min(1.5, en[i] - st[i])))
    if k == "ping": add(ping(float(e.get("f", 1200)), dur, float(e.get("att", .004))), t0, g, pan)
    elif k == "whoosh": add(whoosh(dur), t0, g, pan)
    elif k == "revwhoosh": add(whoosh(dur, True), t0, g, pan)
    elif k == "rumble":
        m = int(dur * sr); r = lp(rng.standard_normal(m), 170) * (1 + .3 * np.sin(2 * np.pi * 23 * np.arange(m) / sr)) * np.sin(np.linspace(0, np.pi, m)) ** .7
        add(r / np.abs(r).max(), t0, g, pan)
    elif k == "swell":
        m = int(dur * sr); tt = np.arange(m) / sr
        s = (np.sin(2 * np.pi * 220 * tt) + .7 * np.sin(2 * np.pi * 330 * tt) + .4 * np.sin(2 * np.pi * 440 * tt)) * np.sin(np.linspace(0, np.pi, m)) ** 2
        add(s, t0, g, pan)
    elif k == "shimmer":
        m = int(dur * sr); s = hp(lp(rng.standard_normal(m), 6000), 2500) * np.sin(np.linspace(0, np.pi, m)) ** 2
        add(s / np.abs(s).max(), t0, g, pan)
    elif k == "chime":
        for f, gg in ((880, 1.0), (1318.5, .7), (1760, .4)): add(ping(f * float(e.get("f", 880)) / 880, 1.6), t0, g * gg, pan)
    elif k == "glass":
        m = int(dur * sr); tt = np.arange(m) / sr; fr = 300 + 700 * (tt / tt[-1]) ** 1.2
        add(np.sin(2 * np.pi * np.cumsum(fr + 15 * np.sin(2 * np.pi * 6 * tt)) / sr) * env_ad(m, .3, .5), t0, g, pan)
v, vsr = sf.read(D + "voice.wav")
if v.ndim > 1: v = v.mean(1)
v = hp(resample_poly(v, sr, vsr), 70); v = v / (np.abs(v).max() + 1e-9) * .85
vv = np.zeros(n); vv[:min(n, len(v))] = v[:n]
env = np.convolve(np.abs(vv), np.ones(int(.06 * sr)) / int(.06 * sr), mode="same")
env = np.convolve(np.clip(env / .06, 0, 1), np.ones(int(.25 * sr)) / int(.25 * sr), mode="same")
duck = 1 - .55 * env
oL = vv + L * duck; oR = vv + R * duck
pk = max(np.abs(oL).max(), np.abs(oR).max())
if pk > .95: oL *= .95 / pk; oR *= .95 / pk
sf.write(D + "audio.wav", np.stack([oL, oR], 1).astype(np.float32), sr); print("peak", round(float(pk), 3), "dur", round(n / sr, 2))
