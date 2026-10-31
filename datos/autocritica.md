# Autocrítica y mejora continua (actualizado 2026-10-31)

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

- 2026-10-30 | [atemporal] voz grabada vs voz propia (conducción ósea; Scientific American; Orepic et al. 2023 PMC9929504; evitado "más aguda" porque la literatura discrepa) | H: bucle exacto (última frase = primera) + gancho afirmación contraintuitiva, 0 texto en pantalla | nota 7/10: cabezas muy esquemáticas, mandíbula/cráneo del esqueleto poco pulido, 29,7 s | resultado: pendiente (48 h). Fonemas OK: 'heard' hˈɜːd, 'hears' hˈɪɹz, 'closer' klˈoʊsɚ (comparativo de 'close'), 'recording' sustantivo.

- 2026-10-30-2 | [morbo] privación de sueño (Dawson & Reid, Nature 1997: 24 h despierto ≈ 0,10 % alcohol en pruebas de rendimiento; Randy Gardner 1964, 264 h; Discover) | H: estructura de cuenta atrás por tiempo (24 h → días → 11 días) con cierre-bucle 'It naps without you' | nota 7/10: figuras esquemáticas, escenas 4 y 5 algo vacías, portada con título tapando la mitad inferior del cerebro, 35,2 s | resultado: pendiente (48 h). Fonemas OK: 'does' dˈʌz, 'last' verbo lˈæst, 'record' sustantivo ɹˈɛkɚd, 'Guinness' ɡˈɪnɪs.

- 2026-10-30-splitsteal | [dilema] dividir o robar (dilema del prisionero; Flood y Dresher, RAND 1950, nombre de Tucker; Van den Assem, Van Dolder y Thaler, Management Science 2012: 574 concursantes, ~53 % comparten, más con botes pequeños) | H: gancho con elección inmediata sin cifras + bucle exacto en pregunta (E19) | nota 7/10: figuras genéricas, suelo gris claro poco atractivo, escena de celdas poco legible, 38,8 s, primer motor 3D 2K | resultado: pendiente (48 h). Fonemas OK: 'split' verbo splˈɪt, 'posed' pˈoʊzd, 'prisoner's' pɹˈɪzənɚz; cifras escritas en letras.

- 2026-10-31 | [ciencia] por qué el cielo es azul y el atardecer rojo (Rayleigh 1/λ⁴; violeta menos presente en el sol y menos visible; fuentes: BigThink y consenso en varias webs) | H: motor 3D con explicación 100% visual (prisma, ondas, barras) + bucle exacto 'The sky is not actually blue.' | nota 7/10: hook algo lavado/blanco en la zona baja, figuras simples (persona cápsula), escena 7 (cuentas que pierden el azul) poco legible, render 14 min a 2K | resultado: pendiente (48 h). Fonemas OK: 'hides' haɪdz, 'bounced' baʊnst, 'violet' vaɪəlɪt; marca de agua en escenas 5 y 6 (sorteo).
- Regla: en wmTag, comprobar que el decal no queda dentro de una esfera (depthTest lo oculta) ni bajo subtítulos; el render 2K con 4 núcleos tarda ~14 min.

## (c) Experimentos (todos con 1-2 vídeos y 100-140 vis.; ninguno confirmado)
- E1 animales+'no es lo que crees', E2 mismo gancho fuera de animales, E3 dato extremo+actualidad, E4 vídeo ~26 s, E5 voz 0,95, E6 cierre pregunta abierta, E7 más movimiento visual, E8 voz 1,15, E9 gancho que interpela, E10 gancho acción física, E11 problema→solución, E13 dilema A/B: tendiendo a refutadas (sin diferencia de alcance).
- E12 morbo (hongo zombi) 135 vis. y E14 anécdota histórica (Newton) 122: sin diferencia con ciencia general; por tipo ciencia/morbo/dilema todo ~110-140.
- E15 'gancho en 2.ª persona con escena inquietante' (parálisis del sueño 29 oct tarde): pendiente.
- E16 dilema #2 con cifras concretas + A/B hablado (ultimátum, 29 oct noche): pendiente.
- E17 bucle exacto (última frase repite la primera) + 0 texto en pantalla (voz propia, 30 oct): pendiente. 29 oct tarde (E15, 123 vis.) y noche (E16, 129 vis.): sin diferencia.
- E18 estructura de cuenta atrás temporal (privación de sueño, 30 oct tarde): pendiente. Voz grabada (E17) 151 vis., sin diferencia clara.
- Conclusión provisional: el alcance (~110-140) no depende de ninguna variable de contenido probada; probable cuello de botella de distribución (cuenta pequeña). No sobreajustar.
- Notas técnicas: la letra 'A' hablada: usar 'eigh' en voz (subtítulo 'A'); tts_gen.py acepta clave "voice" en script.json para separar voz y subtítulos;  tts_gen.py acepta velocidad (3.er arg); portada: capturar con window.subs vacío, recortar 10 px inferiores (barra), crop+pad para subir el motivo sobre la zona del título; nombres raros (Encke) mal en kokoro: evitarlos.
- E19 dilema #3 (dividir o robar) con elección binaria inmediata y bucle en la pregunta final (30 oct noche): pendiente. Entorno: python3 del sistema = /usr/bin/python3; playwright pip debe ser 1.63.0 (casa con chromium-1243); requests hay que instalarlo.
- E20 ciencia 3D 100% visual + bucle exacto (cielo azul, 31 oct): pendiente. Comparar con E19 split or steal (181 vis.).
