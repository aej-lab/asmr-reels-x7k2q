# ASMR Explains · motor de vídeo 3D 2K (v1, 2026-10-30)

Genera un Reel vertical **1440x2560 (2K), 30 fps, 25-40 s** con escenas 3D hechas en código (three.js, modelos procedurales: sin descargas ni licencias), cámara en movimiento, transiciones, voz Kokoro y sonido. Sustituye a los pasos 4-5 de la PIPELINE.md de Drive (escenas 2D y render) y a la marca de agua de abajo a la izquierda.

## Ficheros (carpeta motor3d/ del repositorio)
- `vendor/three.min.js` (three.js r160), `engine.js` (subtítulos palabra a palabra, polvo, grano, viñeta), `lib3d.js` (piezas, cámaras, transiciones, marca de agua; NO se edita).
- `tts_gen.py` (voz), `audio3.py` (sonido), `render3d.py` (render), `cover3d.py` (portada), `qa3d.py` (hojas de contacto).
- `ejemplo_contrails/`: vídeo completo de ejemplo (`script.json`, `scenes.js`, `audio_events.json`). LÉELO ENTERO antes de escribir escenas: es la referencia de estilo y de API.

## Preparación (contenedor nuevo)
```
pip install --break-system-packages -q kokoro-onnx soundfile scipy numpy pillow
W=/tmp/asmr; mkdir -p $W/out; cd $W
curl -sSL -o kokoro.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -sSL -o voices.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
M=<ruta del repo>/motor3d      # ya clonado en la sesión
```
Chromium (Playwright) ya está instalado: NO ejecutes `playwright install`. ffmpeg, Pillow, numpy, scipy y la fuente Inter también.

## Flujo
1. **Tema, guion y voz** como siempre (reglas del mensaje de la tarea; `script.json` = {"segments":[...]}; 9-12 frases). `python3 $M/tts_gen.py $W/script.json $W 1.06` → `out/voice.wav` + `out/timing.json`. Revisa pronunciación como indica la tarea.
2. **Escenas**: escribe `$W/scenes.js` con UNA escena por frase (mismo orden). Define `const BUILD=[()=>escena0(), ...]` (una función por frase que devuelve un *rig*) y `const TRANS=[null,'whip','push','whipUp','whipL','dissolve',...]` (TRANS[i] = transición al entrar en la escena i; null para la 0). Copia la estructura de `ejemplo_contrails/scenes.js`.
3. **Sonido**: `$W/audio_events.json` (ver cabecera de `audio3.py`: ping, whoosh, revwhoosh, rumble, swell, shimmer, chime, glass; tiempos relativos al inicio de la escena). Sin música. Luego `python3 $M/audio3.py $W`.
4. **Vista previa** (obligatoria): `python3 $M/render3d.py $W preview` (2 fotogramas por escena, `out/pNN.jpg`; unos 3-4 s por fotograma a 2K). Haz una hoja de contacto con ffmpeg tile y MÍRALA con Read. Corrige encuadres, cortes y solapes. Máximo 3 rondas.
5. **Render completo** (tarda ~1 h a 2K con 2 núcleos; EN SEGUNDO PLANO): `cd $W && nohup python3 $M/render3d.py $W full --workers $(nproc) > out/render.log 2>&1 &`. Va por trozos de 90 fotogramas en `out/parts/` y se REANUDA: si la sesión se corta o falla, relanza el MISMO comando. Espera con un bucle `until [ -f out/video_raw.mp4 ] || ! pgrep -f render3d.py >/dev/null; do sleep 30; done` (comprobaciones espaciadas de ≤9 min por llamada; no consultes cada pocos segundos). Si al acabar no existe `out/video_raw.mp4`, relanza el comando (reanuda). Si en total pasan 100 min sin terminar, repite el render con `--sc 1.5` (1080x1920) y dilo en el resumen.
6. **Mezcla**: `ffmpeg -y -i out/video_raw.mp4 -i out/audio.wav -c:v libx264 -crf 23 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/final.mp4` (NO hay drawtext: la marca de agua va dentro de las escenas).
7. **QA**: `python3 $M/qa3d.py $W` (hojas `out/qa_sheet_N.jpg`; mira TODAS con Read) + comprobar duración 25-40 s, audio presente (volumedetect) y que la marca de agua aparece 2 veces. Autocrítica y publicación como indica la tarea.
8. **Portada**: `python3 $M/render3d.py $W cover <t>` (fotograma SIN subtítulos, elige un segundo vistoso de 0,5-3 s) y `python3 $M/cover3d.py $W "LINEA 1" "LINEA 2" ["LINEA 3"]` → `out/cover.jpg` 1080x1920 con solo el título.

## Escenas: reglas
- Cada escena = `newRig([[r,g,b],[r,g,b],[r,g,b]])` (degradado cielo/fondo), `lights(R,{...})`, objetos en `R.fg` (mundo) o `R.bg` (lejos), y `R.update=(u,d)=>{...}` donde u = segundos desde el inicio de la escena y d = duración. La cámara se coloca SIEMPRE con `aim(R,pos,target,roll,u,shake)` / `orbit` / `dolly` al final de update y se MUEVE en cada escena (órbita, travelling, grúa, push-in). Cada escena debe animarse sola (nada estático).
- Piezas disponibles (lib3d.js): `airliner()`, `Trail`, `molecule()`, `crystal()`, `soot()`, `cloud()`, `noSign3D(cam)`, `clock3D(cam)`, `person(color)`, `balanceScale()`, `bigButton()`, `arrow3D()`, `bars3D()`, `forkTrack()`, materiales `M(color,{...})`, sprites `spr(TEX.glow|puff|spark|dot,...)`, esferas/cilindros/lathe/extrude de three.js (`THREE.*`) para modelos nuevos. Si el tema necesita un objeto nuevo, constrúyelo con primitivas de three.js (geometría procedural, materiales físicos con `M`, luces de contraluz de color) y usa el mismo nivel de acabado que el ejemplo (reflejos, brillos, partículas, profundidad).
- Fondo y atmósfera: degradados, `spr` con brillo aditivo, nubes/partículas en distintas profundidades para paralaje. Evita el negro plano.
- **Texto en pantalla: NINGUNO** salvo los subtítulos (los pone el motor) y la marca de agua. Las ideas se explican con modelos, movimiento, color y símbolos (no-sign, reloj, barras). Si hace falta una cifra/unidad que cuenta, usa un sprite de canvas pequeño y fuera de la zona de subtítulos (y < 260 px de la parte alta y bottom 230 px). Nunca repitas lo que dice la voz.
- Zona segura: contenido importante entre y 280-1050 de 1280 (en coordenadas lógicas 720x1280); subtítulos arriba (y≈215). Instagram tapa los ~230 px inferiores.
- Contenido sensible (morbo, dilemas): simbólico y abstracto (siluetas `person`, balanzas, caminos, botones), sin sangre, cuerpos ni violencia gráfica.
- Transiciones: alterna `'whip'`, `'whipL'`, `'whipUp'`, `'push'` y `'dissolve'`; no repitas la misma dos veces seguidas.
- Última escena enlaza con la primera (bucle): reutiliza la cámara/objeto de la escena 0 (ver `buildHook(true)` del ejemplo).

## Marca de agua INTEGRADA (obligatoria; sustituye a la de abajo a la izquierda)
- Aparece **exactamente 2 veces** en el vídeo, en 2 escenas distintas ELEGIDAS AL AZAR (con python `random.sample`, nunca la escena 0 ni la última), unos 2-2,5 s cada vez, con fundido (`wmShow`), opacidad máx. 0,8: visible pero sin estorbar (lejos de los subtítulos y del objeto principal en acción).
- Siempre integrada en un objeto de la escena, como pintura, cristal o tiza. Ideas: fuselaje de un avión (`plane.userData.wm` ya existe en `airliner()`: `wmShow(plane.userData.wm,u,t0,t1)`), cara de un cristal o gota (`wmTag(R.fg,{pos,w,style:'paint'})` + `wmFace(m,R)` colocada delante del cristal tras `aim`), pared o suelo (`style:'chalk'`), pantalla, caja, balanza, pastilla, placa, cartel pintado en una pared del fondo, etc. Sé creativo con el objeto del tema.
- API: `wmTag(parent,{pos:[x,y,z],rot:[rx,ry,rz],w:ancho,style:'paint'|'glow'|'chalk'})`, `wmShow(mesh|[meshes],u,t0,t1,max)`, `wmFace(mesh,R)`. 'paint' = tinta oscura (sobre fondos claros); 'chalk'/'glow' = blanco (sobre fondos oscuros). `wmFace` y la posición dependiente de la cámara se calculan DESPUÉS de `aim(...)` dentro de `update`.
- Comprueba en la vista previa un fotograma de cada aparición (usa el segundo medio de la ventana) y verifica que el texto se lee completo y no está cortado ni tapado.

## Rendimiento
A 2K cada fotograma tarda ~2,6 s por software; un vídeo de 38 s son ~1150 fotogramas (~50-60 min con 2 núcleos; con `--workers` = nº de núcleos baja). No hay GPU. Si el contenedor es más lento, `--sc 1.5`.
