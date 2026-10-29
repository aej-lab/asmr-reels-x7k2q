# Autocrítica y mejora continua (actualizado 2026-10-29 noche)

## (a) Reglas aprendidas
- Revisar la pronunciación de heterónimos (lives, read, lead, wind, tear...) con los fonemas de kokoro antes de generar el audio.
- Nada de textos redundantes en pantalla (los subtítulos ya dicen la frase); solo cifras/unidades o nombres no hablados.
- La portada nunca lleva subtítulos: se captura la escena con `window.subs=function(){}` y se tapa la barra de progreso inferior.
- Fotograma 0 nunca vacío: la primera escena fija `ctx.globalAlpha=1` al inicio (si no, el fade-in deja negro el arranque).
- Entorno: kokoro y playwright están en `/usr/bin/python3` (3.13), no en `python3`. En curl con llaves usar `-g`. faster-whisper no puede bajar el modelo (proxy 403): comprobar locución con fonemas + silencedetect.
- Business Discovery da "nonexisting field" con este token: no insistir.
- Python con playwright/Pillow: `/usr/bin/python3 -m pip install --break-system-packages playwright pillow numpy` (si falta); `PIL` del sistema falla, recortar/escalar portada con ffmpeg.
- Contadores animados cuentan como "textos distintos" en check_redundant: usar la cifra final estática.

- Regla: los iconos clave (candado, interruptor...) deben ser grandes (>=100 px) y legibles; una cápsula vacía se lee como interruptor, no como cuerpo.
- Entorno: render con node (`NODE_PATH=$(npm root -g) node render.js preview|full|nosubs`); python playwright no existe. Scripts de Drive: reescribir a mano desde read_file_content (base.html con fotograma 0 sin fundido).

## (b) Registro de vídeos (condensado; nota 7/10 en todos salvo indicación; locución verificada con fonemas + silencedetect, sin whisper)
- 10-23 arañas (animal) 128 vis. | 10-23-2 hielo seco 128 | 10-24 Luna llena 119 | 10-24-2 piel de gallina 136 | 10-25 calabaza 126 | 10-25-2 ojos de gato 117.
- 10-26 estrellas fugaces 119 | 10-26-2 glow sticks 112 | 10-27 bostezo 137 | 10-27-2 taza/océano 140 | 10-28 búho 139 | 10-28-2 [morbo] hongo zombi 135 | 10-28-3 [noticia manual] Urda 126 | 10-28-4 [dilema] tranvía 118.
- 10-29 Newton y fosfenos (cuerpo) H: anécdota histórica | 122 vis., 2 interacciones.
- 2026-10-29-2 | [morbo] parálisis del sueño (REM atonía; Sharpless & Barber 2011 7,6 %; PMC 2024) | H: gancho en segunda persona con escena inquietante ('You wake up and cannot move') + cierre-pregunta en bucle retiene/comenta más | nota 7/10: figuras muy esquemáticas, escena 6 (cuerpo-cápsula) parece un interruptor, candado de escena 4 diminuto, 35,7 s | resultado: pendiente (48 h). Fonemas OK ('cannot' kænˈɑːt, 'frightened' fɹˈaɪʔnd, 'woken', 'During').

- 2026-10-29-3 | [dilema] juego del ultimátum (Güth 1982; <20 % rechazado ~50 %; ofertas típicas 40-50 %: imotions, Decision Lab, ScienceDirect) | H: gancho con cifras concretas en 2.ª persona ("$2 de $10") + cierre A/B hablado + voz 1,10 | nota 7/10: figuras genéricas, escenas 6 y 8 algo vacías, 39 s | resultado: pendiente (48 h). Fonemas OK: 'A'(artículo ɐ), 'eigh'→eɪ para la letra A, 'refuse' verbo, 'close' no usado.

## (c) Experimentos (todos con 1-2 vídeos y 100-140 vis.; ninguno confirmado)
- E1 animales+'no es lo que crees', E2 mismo gancho fuera de animales, E3 dato extremo+actualidad, E4 vídeo ~26 s, E5 voz 0,95, E6 cierre pregunta abierta, E7 más movimiento visual, E8 voz 1,15, E9 gancho que interpela, E10 gancho acción física, E11 problema→solución, E13 dilema A/B: tendiendo a refutadas (sin diferencia de alcance).
- E12 morbo (hongo zombi) 135 vis. y E14 anécdota histórica (Newton) 122: sin diferencia con ciencia general; por tipo ciencia/morbo/dilema todo ~110-140.
- E15 'gancho en 2.ª persona con escena inquietante' (parálisis del sueño 29 oct tarde): pendiente.
- E16 dilema #2 con cifras concretas + A/B hablado (ultimátum, 29 oct noche): pendiente.
- Conclusión provisional: el alcance (~110-140) no depende de ninguna variable de contenido probada; probable cuello de botella de distribución (cuenta pequeña). No sobreajustar.
- Notas técnicas: la letra 'A' hablada: usar 'eigh' en voz (subtítulo 'A'); tts_gen.py acepta clave "voice" en script.json para separar voz y subtítulos;  tts_gen.py acepta velocidad (3.er arg); portada: capturar con window.subs vacío, recortar 10 px inferiores (barra), crop+pad para subir el motivo sobre la zona del título; nombres raros (Encke) mal en kokoro: evitarlos.
