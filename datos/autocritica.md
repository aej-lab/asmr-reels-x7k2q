# Autocrítica y mejora continua (actualizado 2026-10-27)

## (a) Reglas aprendidas
- Revisar la pronunciación de heterónimos (lives, read, lead, wind, tear...) con los fonemas de kokoro antes de generar el audio.
- Nada de textos redundantes en pantalla (los subtítulos ya dicen la frase); solo cifras/unidades o nombres no hablados.
- La portada nunca lleva subtítulos: se captura la escena con `window.subs=function(){}` y se tapa la barra de progreso inferior.
- Fotograma 0 nunca vacío: la primera escena fija `ctx.globalAlpha=1` al inicio (si no, el fade-in deja negro el arranque).
- Entorno: kokoro y playwright están en `/usr/bin/python3` (3.13), no en `python3`. En curl con llaves usar `-g`. faster-whisper no puede bajar el modelo (proxy 403): comprobar locución con fonemas + silencedetect.
- Business Discovery da "nonexisting field" con este token: no insistir.
- Python con playwright/Pillow: `/usr/bin/python3 -m pip install --break-system-packages playwright pillow numpy` (si falta); `PIL` del sistema falla, recortar/escalar portada con ffmpeg.
- Contadores animados cuentan como "textos distintos" en check_redundant: usar la cifra final estática.

## (b) Registro de vídeos
- 2026-10-23 (mañana) | arañas/tela pegajosa | animal, gancho pregunta | nota ? | 128 vis., 0 guardados/compartidos a las 24 h.
- 2026-10-23-2 | niebla del hielo seco (Halloween) | H: gancho "no es lo que crees" funciona fuera de animales | nota 7/10: ritmo algo lento en frase 2 (6 s), dibujos simples; sin whisper para verificar locución | resultado: 128 vis., 0 guardados a las ~16 h (pendiente 48 h).
- 2026-10-24 | Luna llena = un solo instante (Luna del Cazador, noticia) | H: gancho de dato extremo sin pregunta + tema de actualidad rinde más | nota 7/10: escena del sol que se pone es breve y casi estática, varias escenas con poco movimiento, sin whisper (locución verificada con fonemas + silencedetect) | resultado: pendiente (48 h).

- 2026-10-24-2 | piel de gallina (cuerpo, Halloween) | H: vídeo más corto (~26 s, 7 frases) retiene más | nota 7/10: dibujos esquemáticos y muy parecidos entre escenas, la portada deja pelos detrás del título, locución sin whisper (fonemas + silencedetect OK) | resultado: pendiente (48 h).
- 2026-10-25 | calabaza = baya (comida/planta, Halloween) | H: voz más lenta y calmada (0,95 en vez de 1,05) rinde más retención | nota 7/10: dibujos sencillos, escena de pepinos/sandía pequeña, 27,9 s, sin whisper (fonemas + silencedetect OK; 'pepo' = pˈiːpoʊ) | resultado: pendiente (48 h).
- 2026-10-25-2 | ojos de gato no brillan (animal) | H: cierre en pregunta abierta ('whose light is it?') genera más comentarios/compartidos que el cierre en afirmación | nota 7/10: gato de la escena 5 simplón, escena de la bombilla algo genérica, sin whisper (fonemas + silencedetect OK), portada con ojos desplazados abajo para no tapar el título | resultado: pendiente (48 h).

## (c) Experimentos
- E1 "animales + gancho 'no es lo que crees' rinde más que el resto": 2 vídeos (murciélagos 1.617, arañas 128). Veredicto: datos insuficientes, tendiendo a refutada (efecto no repetido).
- E2 "gancho 'no es lo que crees' fuera de animales": 1 vídeo (hielo seco), pendiente.
- E3 "gancho de dato extremo sin pregunta + actualidad": 1 vídeo (Luna llena 24 oct), pendiente.
- E2 actualizado: hielo seco 128 vis. a ~16 h, sin diferencia con el resto: tendiendo a refutada.
- E4 "vídeo ~26 s rinde mejor que 30-36 s": 1 vídeo (piel de gallina 24 oct tarde), pendiente.
- E3 actualizado: Luna llena 119 vis. a <24 h, sin mejora sobre el resto: tendiendo a refutada.
- E4 actualizado: piel de gallina 136 vis. a <24 h, sin mejora: tendiendo a refutada.
- E5 "voz más lenta (0,95) rinde más que 1,05": 1 vídeo (calabaza 25 oct), pendiente.
- Regla nueva: fotograma 0 con el elemento principal ya visible (tamaño inicial >=60 %), no a escala 0.
- E6 "cierre en pregunta abierta aumenta comentarios/compartidos": 1 vídeo (ojos de gato 25 oct tarde), pendiente.
- Regla nueva: en la portada, si el motivo principal cae en la zona del título (y 700-1200), desplazar el fondo (pad) para que el título no lo tape.
- 2026-10-26 | estrellas fugaces = granos de arena (espacio, Táuridas/Halloween) | H: estilo visual con más movimiento (meteoros, partículas, brillos) retiene más | nota 7/10: escena de compresión del aire es abstracta (puntos), meteoros pequeños y poco brillo, 34,5 s, sin whisper (fonemas + silencedetect OK; 'Encke' sonaba 'enk-AY' y se reescribió la frase sin el nombre) | resultado: pendiente (48 h).
- E7 "estilo visual con más movimiento/brillo rinde más": 1 vídeo (estrellas fugaces 26 oct), pendiente.
- Regla nueva: nombres propios raros (Encke...) salen mal en kokoro: reescribir sin ellos.
- E5 actualizado: calabaza 126 vis. a 48 h, sin mejora con voz 0,95: tendiendo a refutada. E6: ojos de gato 117 vis., 0 comentarios: tendiendo a refutada.
- 2026-10-26-2 | glow sticks (quimioluminiscencia, Halloween) | H: ritmo más rápido (voz 1,15 vs 0,95-1,05) retiene más | nota 7/10: átomo/electrón muy esquemático, brillo frío vs cálido apenas se distingue, sin whisper (fonemas + silencedetect OK; 'dye','glow','reacts' verificados) | resultado: pendiente (48 h).
- E8 "voz más rápida (1,15) rinde más que 0,95-1,05": 1 vídeo (glow sticks 26 oct tarde), pendiente. E7 estrellas fugaces (26 oct mañana): 119 vis. a <24 h, sin mejora: tendiendo a refutada.
- Nota técnica: tts_gen.py acepta velocidad como 3.er argumento; check_overlaps/check_redundant no se usaron hoy (escenas sin texto).
- 2026-10-27 | bostezo contagioso (cuerpo/psicología, atemporal, no Halloween) | H: gancho que interpela al espectador ("I bet you'll yawn...") + cierre-pregunta en bucle genera más compartidos/comentarios | nota 7/10: caras de dibujo muy esquemáticas (sin texto, bien), escena de la balanza sencilla, la escena del cerebro/termómetro dura poco, 27,9 s, sin whisper (fonemas + silencedetect OK; 'yawn','you'll','yours' verificados) | resultado: pendiente (48 h).
- E9 "gancho que interpela al espectador + tema universal no estacional rinde más que los de dato/pregunta": 1 vídeo (bostezo 27 oct), pendiente. E8 glow sticks (voz 1,15): 112 vis. a <24 h, sin mejora: tendiendo a refutada.
- Regla nueva: si el guion tiene N frases, N escenas exactas (hoy se corrigió un desfase al fusionar dos ideas en una frase: usar una escena con dos fases).
