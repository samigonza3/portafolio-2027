---
name: "ai-animated-storyboard"
description: "Genera storyboards de videos animados con IA (personajes 3D tipo órgano/mascota) con prompts text-to-image, image-to-video, voz en off, sonido y duración exacta por clip."
---

# AI Animated Storyboard

Convierte un producto, un dolor o una idea en un storyboard listo para producir un video vertical animado con IA (estilo personaje 3D tipo Pixar dentro del cuerpo: tiroides, hígado, páncreas, intestino, células, etc.). El usuario solo copia y pega cada prompt en su plataforma.

Se activa cuando el usuario pida: "storyboard animado", "video animado con IA", "guion con prompts de imagen y video", "video tipo personaje órgano", "hazme el ANIMATE", o nombre un producto/suplemento y quiera un video animado.

## Paso 1. Brief mínimo

Si falta algo, pregunta en una sola tanda (máximo 4 preguntas). Si el usuario no responde, asume los valores por defecto:

1. Producto y beneficio principal (ej: Berberina Premium 1500, apoyo al metabolismo de la glucosa).
2. Duración objetivo: 15, 30 o 45 segundos. Por defecto 30.
3. Plataforma de destino: Meta Reels, TikTok o ambas. Por defecto ambas, formato 9:16.
4. Idioma y acento de la voz: por defecto español neutro latino con tono colombiano cercano, tratando de "tú" (nunca "vos").
5. Modelo de video que usará: Seedance, Kling, Hailuo, Veo u otro. Por defecto Kling (clips de 5 o 10 s). Esto define las duraciones permitidas.

## Paso 2. Concepto y estructura narrativa

Usa esta estructura de 4 actos adaptada al tiempo total:

1. HOOK (0 a 3 s): el personaje villano o el órgano sufriendo, imagen extraña que detiene el scroll. Frase de voz corta y provocadora.
2. PROBLEMA (3 a 12 s): qué pasa dentro del cuerpo, explicado como historia (el villano ataca, el órgano se cansa, se inflama, se "traba").
3. GIRO / SOLUCIÓN (12 a 22 s): entra el héroe (el ingrediente o el producto personificado) y cambia la escena.
4. RESULTADO + CTA (22 a 30 s): el órgano feliz y brillante, y un llamado a la acción claro.

Define en una línea: villano, héroe, escenario y emoción dominante.

## Paso 3. Biblia de personajes (consistencia)

Para cada personaje escribe un bloque fijo que se repite palabra por palabra en todos los prompts donde aparezca:

Nombre interno | descripción física (forma, color exacto, textura, tamaño relativo, ojos, boca, extremidades) | estilo de render | expresión base.

Ejemplo: "a small chubby purple furry monster with fluffy fur, big droopy yellow eyes, wide toothy grin, short stubby arms, Pixar-style 3D render, soft subsurface lighting".

Regla: primero se genera una imagen de referencia del personaje sobre fondo neutro, y todas las escenas se generan usando esa imagen como referencia (character reference / image reference) cuando la plataforma lo permita.

## Paso 4. Reglas de tiempo

Duraciones permitidas según modelo (ajusta si el usuario indica otro):
Kling: 5 o 10 s. Seedance: 5 a 10 s (8 s ideal). Hailuo: 6 o 10 s. Veo: 8 s. Wan: 5 s.

La suma de clips debe igualar la duración objetivo (tolerancia de 1 s que se corrige en edición).

Voz en off en español: máximo 2,5 palabras por segundo de clip. Un clip de 5 s admite hasta 12 palabras; uno de 10 s, hasta 25. Si la línea no cabe, se recorta la línea, nunca se alarga el clip.

El hook nunca dura más de 3 s de voz aunque el clip dure 5 s.

## Paso 5. Prompts

Text-to-image (una por escena), en inglés, en este orden:
[bloque del personaje] + [acción o pose] + [escenario interno del cuerpo con detalles orgánicos] + [iluminación] + [cámara y lente] + "vertical 9:16, cinematic, Pixar-style 3D render, highly detailed, volumetric light, shallow depth of field".

Image-to-video (una por escena), en inglés, corto y centrado en MOVIMIENTO, no en describir de nuevo la imagen:
[movimiento del personaje] + [movimiento de cámara: slow push in, orbit, handheld, dolly out] + [movimiento del entorno: partículas, pulsos, fluidos] + [ritmo]. Máximo 40 palabras. Indica "no scene change, keep character consistent".

## Paso 6. Sonido

Para cada clip: SFX concretos (latido, burbujeo, crujido orgánico, whoosh, brillo mágico) y la instrucción de música global (género, BPM aproximado, momento del drop, que suele coincidir con la entrada del héroe).

Voz: indica tono (intriga, urgencia, alivio) y la voz sugerida para ElevenLabs u otro TTS (género, edad, energía).

## Paso 7. Cumplimiento (siempre revisar antes de entregar)

Para suplementos y salud en Meta y TikTok:
No prometer curar, tratar o prevenir enfermedades. Usar "apoya", "contribuye", "ayuda a mantener".
No usar antes/después de cuerpos reales ni señalar características personales ("¿tienes diabetes?").
Nada de sangre realista, gore ni imágenes médicas perturbadoras: todo estilizado y amable.
No usar personajes con derechos de autor ni parecidos a personajes conocidos.
Si alguna línea incumple, reescríbela y avisa en una línea al final.

## Formato de salida

Entrega en este orden, sin viñetas ni guiones largos:

1. Concepto en 2 líneas (villano, héroe, escenario, emoción).
2. Biblia de personajes (un bloque por personaje) + prompt de imagen de referencia de cada uno.
3. Tabla del storyboard con columnas: # | Tiempo (inicio a fin) | Duración clip | Acto | Prompt T2I | Prompt I2V | Voz en off (ES) | SFX.
4. Música global y voz sugerida.
5. Resumen de producción: número de clips, segundos totales generados, costo estimado (segundos × tarifa por segundo del modelo elegido) y orden de ensamblaje en CapCut.
6. Bloque JSON final para automatización con esta forma:

```json
{
  "title": "",
  "aspect_ratio": "9:16",
  "video_model": "",
  "characters": [{"id": "", "reference_prompt": ""}],
  "scenes": [
    {"n": 1, "start": 0, "duration": 5, "t2i": "", "i2v": "", "vo": "", "sfx": "", "characters": [""]}
  ],
  "music": "",
  "voice": ""
}
```

## Variaciones

Si el usuario pide variaciones, cambia el hook y el villano manteniendo héroe y CTA, para poder testear ángulos en Meta sin rehacer todo el video. Entrega 3 hooks alternativos (clip 1 completo) al final si el usuario pide "con variaciones".