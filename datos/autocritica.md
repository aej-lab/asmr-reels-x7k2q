# Autocrítica y mejora continua (actualizado 2026-10-23)

## (a) Reglas aprendidas
- Revisar la pronunciación de heterónimos (lives, read, lead, wind, tear...) con los fonemas de kokoro antes de generar el audio.
- Nada de textos redundantes en pantalla (los subtítulos ya dicen la frase); solo cifras/unidades o nombres no hablados.
- La portada nunca lleva subtítulos: se captura la escena con `window.subs=function(){}` y se tapa la barra de progreso inferior.
- Fotograma 0 nunca vacío: la primera escena fija `ctx.globalAlpha=1` al inicio (si no, el fade-in deja negro el arranque).
- Entorno: kokoro y playwright están en `/usr/bin/python3` (3.13), no en `python3`. En curl con llaves usar `-g`. faster-whisper no puede bajar el modelo (proxy 403): comprobar locución con fonemas + silencedetect.
- Business Discovery da "nonexisting field" con este token: no insistir.
- Contadores animados cuentan como "textos distintos" en check_redundant: usar la cifra final estática.

## (b) Registro de vídeos
- 2026-10-23 (mañana) | arañas/tela pegajosa | animal, gancho pregunta | nota ? | 128 vis. a las 7 h, 0 guardados.
- 2026-10-23-2 | niebla del hielo seco (Halloween) | H: gancho "no es lo que crees" funciona fuera de animales | nota 7/10: ritmo algo lento en frase 2 (6 s), dibujos simples; sin whisper para verificar locución | resultado: pendiente (48 h).

## (c) Experimentos
- E1 "animales + gancho 'no es lo que crees' rinde más que el resto": 2 vídeos (murciélagos 1.617, arañas 128). Veredicto: datos insuficientes, tendiendo a refutada (efecto no repetido).
- E2 "gancho 'no es lo que crees' fuera de animales": 1 vídeo (hielo seco), pendiente.
