---
name: seo-geo-description-optimizer
description: >
  Optimiza descripciones de productos, servicios o marcas aplicando lógica dual SEO/GEO
  (Generative Engine Optimization) con voz de marca minimalista, premium y confiable.
  Usa este skill siempre que el usuario proporcione una descripción y quiera mejorarla para
  posicionamiento en buscadores y en respuestas de modelos de IA, manteniendo un tono de
  marca sofisticado. Activa cuando el usuario diga "optimiza esta descripción", "mejora mi
  copy para SEO", "quiero que mi descripción ranquee", "adapta esto a mi marca premium",
  "hazlo más minimalista y profesional", "optimiza para GEO", "quiero que los AI citen mi
  producto", o cuando paste cualquier descripción de producto/servicio y pida mejorarla.
  SIEMPRE activa para cualquier tarea de reescritura de descripciones con intención de
  posicionamiento — aunque el usuario no mencione "SEO" o "GEO" explícitamente.
---

# SEO/GEO Description Optimizer

Optimiza descripciones aplicando lógica de posicionamiento dual: SEO para motores de
búsqueda tradicionales + GEO para ser referenciado por modelos generativos de IA (ChatGPT,
Perplexity, Claude, Gemini), todo dentro de un estilo de marca minimalista, premium y
confiable.

---

## Marco conceptual

### Los tres vectores del skill

**1. SEO (Search Engine Optimization)**
- Keywords de intención primaria y semántica LSI integradas naturalmente
- Estructura que satisface tanto el fragmento destacado como la búsqueda conversacional
- Densidad semántica: cada oración trabaja
- Evitar keyword stuffing — señal de baja calidad para Google y para el lector

**2. GEO (Generative Engine Optimization)**
- Los LLMs prefieren texto con: autoridad factual, estructura clara, afirmaciones verificables
- Evitar hipérbole vaga ("el mejor", "increíble") — los modelos no citan lo que no pueden validar
- Incluir especificidad: materiales, procesos, beneficios medibles, diferenciales concretos
- Sintaxis directa: sujeto → verbo → beneficio/atributo
- Los modelos citan lo que suena como "fuente confiable", no como "copy de ventas"

**3. Voz de marca: Minimalista · Premium · Confiable**

| Atributo | Qué significa | Qué eliminar |
|---|---|---|
| **Minimalista** | Cada palabra tiene función. Sin adornos. | Adjetivos decorativos, redundancias, frases de relleno |
| **Premium** | Lenguaje de valor, no de precio. Eleva la percepción. | Urgencia falsa, descuentos, exclamaciones, superlativos vacíos |
| **Confiable** | Preciso, verificable, sin promesas infladas. | Hipérbole, "el mejor del mundo", claims sin respaldo |

**La tensión central**: SEO clásico empuja a más volumen de palabras y repetición. GEO + marca premium empujan a condensación y precisión. Este skill resuelve esa tensión priorizando **calidad semántica sobre volumen**.

---

## Proceso de optimización

### Paso 1 — Diagnóstico de la descripción original

Antes de reescribir, analiza en silencio:
- ¿Cuál es el producto/servicio/marca?
- ¿Qué keywords de intención están presentes o ausentes?
- ¿Qué claims son vagos vs. específicos?
- ¿Qué elementos violan el estilo de marca (hipérbole, urgencia, relleno)?
- ¿Qué información factual podría volverlo citable por un LLM?

### Paso 2 — Inferir contexto si no fue dado

Si el usuario no especifica:
- **Plataforma de destino**: preguntar o inferir (web, Shopify, marketplace, ficha de Google)
- **Longitud**: corta (50–100 palabras), media (100–200), larga (200–350)
- **Categoría**: producto físico, servicio, marca, colección

Si el contexto es claro desde el input, proceder directamente sin preguntar.

### Paso 3 — Reescritura con lógica dual

**Estructura recomendada para la descripción optimizada:**

```
[Oración de apertura: qué es + diferencial central — sin adjetivos vacíos]
[Cuerpo: 2-4 oraciones con atributos específicos + keywords semánticas naturales]
[Cierre: beneficio tangible para el usuario o llamada a la acción austera]
```

**Checklist interno antes de entregar:**
- [ ] ¿Cada adjetivo tiene función? (eliminar si no)
- [ ] ¿Las keywords están integradas, no forzadas?
- [ ] ¿Alguna oración puede citarse como "dato" por un modelo de IA?
- [ ] ¿El tono es de valor, no de venta agresiva?
- [ ] ¿Pasaría un filtro de "¿esto lo diría una marca de lujo"?

---

## Output estándar

Entrega siempre **tres bloques**:

### 🔍 Diagnóstico
Breve análisis (3–5 puntos) de los problemas encontrados en la descripción original:
problemas de SEO, claims vagos, violaciones de tono, oportunidades perdidas.

### ✦ Descripción optimizada
La versión reescrita. Sin explicaciones inline. Lista para usar.

### 📐 Notas técnicas
Explica brevemente (bullets concisos):
- Keywords de intención integradas y por qué
- Cambios de tono y qué problema resolvieron
- Qué hace esta versión más citable para modelos de IA
- Si aplica: variante alternativa (distinto ángulo o plataforma)

---

## Reglas de estilo irrompibles

1. **Nunca usar**: "el mejor", "increíble", "revolucionario", "de alta calidad" (sin respaldo), "único en su tipo" (sin evidencia), signos de exclamación, MAYÚSCULAS para énfasis
2. **Siempre preferir**: verbos activos sobre adjetivos pasivos, especificidad sobre generalidad, beneficio sobre característica cuando sea posible
3. **Longitud**: la descripción optimizada no debe ser más larga que la original sin una razón justificada — el objetivo es densificar, no inflar
4. **Keywords**: nunca más de 2 keywords primarias por descripción; las demás deben ser variaciones semánticas o LSI
5. **GEO signal**: incluir al menos una afirmación que sea factualmente verificable o específica (ingrediente, material, proceso, métrica, origen)

---

## Ejemplos de transformación

### Ejemplo 1 — Skincare

**Original:**
> "¡Nuestra crema hidratante es increíble! La mejor del mercado, hecha con ingredientes naturales de alta calidad que transformarán tu piel. ¡Pruébala ahora!"

**Optimizada:**
> "Crema hidratante formulada con ácido hialurónico de bajo peso molecular y manteca de karité certificada. Restaura la barrera cutánea con uso diario, sin fragancias ni parabenos. Textura ligera, absorción en 60 segundos."

**Por qué funciona**: keywords de intención (crema hidratante, ácido hialurónico), GEO signal (especificidad de ingredientes, tiempo de absorción), tono premium (sin exclamaciones, sin superlativos).

---

### Ejemplo 2 — Servicio profesional

**Original:**
> "Somos una agencia de marketing digital con muchos años de experiencia. Ofrecemos soluciones para tu negocio. ¡Contáctanos!"

**Optimizada:**
> "Agencia de marketing digital especializada en campañas de paid search y paid social para marcas de e-commerce. Gestión basada en datos, con reportes semanales y optimización continua de ROAS."

**Por qué funciona**: keywords de intención (marketing digital, paid search, e-commerce), GEO signal (metodología específica, métrica ROAS), tono confiable (sin hipérbole, sin urgencia).

---

## Notas sobre plataformas

| Plataforma | Consideración especial |
|---|---|
| **Shopify / e-commerce** | Priorizar keywords de producto + beneficio en primeras 160 chars (meta description) |
| **Google My Business** | Incluir categoría + ubicación + diferencial en primeras 2 oraciones |
| **LinkedIn / marca personal** | Voz en primera persona austera; logros medibles > adjetivos |
| **Marketplace (Amazon, MercadoLibre)** | Keywords en primeras 50 palabras; bullets específicos si el formato lo permite |
| **Web corporativa** | Balance SEO + GEO; densidad media; autoridad de marca sobre conversión directa |

Si la plataforma no fue especificada, optimizar para web genérica y mencionar la variante más relevante en las notas técnicas.
