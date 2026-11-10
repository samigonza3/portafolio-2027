---
name: meta-ads-scout
description: >
  Agente de inteligencia de mercado que navega Meta Ads Library automáticamente para identificar
  problemas validados, productos ganadores y ángulos de comunicación activos. Usa browser automation
  para scrapear anuncios reales, agrupa pain points por frecuencia y entrega un stack de oportunidades
  comerciales accionable (problema → producto → ángulo).

  SIEMPRE activa para: research de mercado en Meta Ads, nichos validados para dropshipping/ecommerce,
  "busca en Meta Ads Library", "qué están vendiendo en Meta", "dame problemas validados de X nicho",
  "encuentra oportunidades en Meta Ads", "analiza anuncios activos de X", "qué producto puedo vender
  para X dolor", o cualquier solicitud de market intelligence basada en publicidad pagada de Meta.
  Activa incluso si el usuario no menciona "Meta Ads Library" explícitamente.
compatibility: "Requires Claude in Chrome (browser automation)"
---

# Meta Ads Scout

Agente de inteligencia de mercado que navega Meta Ads Library en vivo para descubrir:
1. **Problemas validados** → qué dolores reales tiene el mercado (validados porque alguien paga para dirigirse a ellos)
2. **Productos ganadores** → qué están vendiendo para resolver esos dolores
3. **Ángulos de comunicación** → cómo están hablando de esos productos (hooks, framing, CTAs)

---

## FASE 0 — SETUP INICIAL

### Determinar modo de entrada

Hay dos modos. Elige el que aplique:

**MODO A — El usuario da un nicho específico** (ej: "meno belly", "back pain", "ansiedad")
→ Salta a Fase 1B directamente con esa keyword en inglés + `country=US`

**MODO B — El usuario quiere descubrir nichos desde cero (dropshipping-first)**
→ Ejecuta Fase 1A: entrada por keywords de comportamiento de compra

Si el usuario no especificó nada, pregunta:
```
¿Tienes un nicho en mente, o arrancamos desde cero buscando qué se está vendiendo?
```

---

## FASE 1A — ENTRADA BROAD POR COMPORTAMIENTO DE COMPRA

### Concepto
En lugar de buscar por dolor (que requiere conocer el nicho de antemano), buscamos por **señales de intención de compra** — palabras que aparecen en anuncios de dropshipping independientemente del nicho. Esto revela qué categorías de productos están activas ahora mismo.

### Keywords de entrada por comportamiento (usar en inglés, country=US)

**Grupo 1 — Urgencia y oferta:**
`free shipping today` / `limited time offer` / `50% off today` / `flash sale`

**Grupo 2 — Prueba social:**
`over 10000 customers` / `5 star reviews` / `as seen on` / `sold out twice`

**Grupo 3 — Fricción eliminada:**
`no subscription required` / `money back guarantee` / `ships in 24 hours` / `no gym required`

**Grupo 4 — Problema → solución directa:**
`tired of trying` / `finally works` / `doctors recommended` / `without surgery`

### Paso 1A.1 — Lanzar 2-3 keywords del banco

Elige keywords de grupos distintos y búscalas secuencialmente con `country=US`:
```
https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&media_type=all&q={KEYWORD}&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc
```

### Paso 1A.2 — Identificar categorías emergentes

En cada búsqueda anota qué tipos de productos aparecen (salud, beauty, fitness, hogar, mascotas...) y qué categoría se repite en múltiples keywords. Elige la más densa y pasa a Fase 1B.

---

## FASE 1B — BÚSQUEDA POR NICHO CON FUNNEL GEOGRÁFICO

### Reglas de oro — aplicar siempre

> ⚠️ **SOLO DROPSHIPPING DE PRODUCTOS FÍSICOS**
> Ignora y descarta cualquier anuncio de: apps móviles, software, SaaS, cursos, ebooks, membresías, servicios, o cualquier producto digital. Solo cuentan productos físicos enviables.
>
> 🛍️ **FILTRO SHOPIFY OBLIGATORIO en MX y CO**
> Las búsquedas en MX y CO siempre usan el parámetro `&filter_shopify_only=true`. Esto garantiza que solo veas tiendas de e-commerce real, no apps ni servicios. En US se puede buscar sin filtro para ver el panorama completo, pero al analizar productos se priorizan los que tienen tienda Shopify.

### Paso 1B.1 — Secuencia geográfica US → MX → CO

| Ronda | País | Código | Idioma de búsqueda | Filtro Shopify |
|-------|------|--------|--------------------|----------------|
| 1 | Estados Unidos | `US` | **Inglés** | Opcional (ver panorama) |
| 2 | México | `MX` | **Español** | **Obligatorio** |
| 3 | Colombia | `CO` | **Español** | **Obligatorio** |

**Traducción automática de keywords para LATAM:**

| Inglés (US) | Español (MX/CO) |
|-------------|-----------------|
| `home workout` | `ejercicio en casa` |
| `lose weight` | `bajar de peso` / `adelgazar` |
| `back pain` | `dolor de espalda` |
| `belly fat` | `grasa abdominal` / `barriga` |
| `free shipping` | `envío gratis` |
| `sold out` | `agotado` / `últimas unidades` |
| `posture corrector` | `corrector de postura` |
| `skin care` | `cuidado de la piel` |
| `knee pain` | `dolor de rodilla` |
| `neck pain` | `dolor de cuello` |
| `anxiety` | `ansiedad` |
| `hair loss` | `caída del cabello` |

Si la keyword no tiene traducción directa, usa la que mejor capture la intención en español colombiano/mexicano.

**URLs por ronda:**

Ronda 1 — US (sin filtro Shopify):
```
https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&media_type=all&q={KEYWORD_EN}&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc
```

Ronda 2 — MX (con filtro Shopify, en español):
```
https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=MX&media_type=all&q={KEYWORD_ES}&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc&filter_shopify_only=true
```

Ronda 3 — CO (con filtro Shopify, en español):
```
https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=CO&media_type=all&q={KEYWORD_ES}&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc&filter_shopify_only=true
```

### Paso 1B.2 — Tabla de saturación por geografía

Al completar las 3 rondas, construye esta tabla:

```
KEYWORD EN: [keyword inglés] | KEYWORD ES: [keyword español]
┌──────────────┬──────────┬─────────────┬─────────────┬───────────────────────────────┐
│ País         │ Activos  │ Total hist. │ Shopify     │ Señal                         │
├──────────────┼──────────┼─────────────┼─────────────┼───────────────────────────────┤
│ US           │ X        │ X           │ (sin filtro)│ [saturado / maduro / virgen]  │
│ MX (ES)      │ X        │ X           │ ✅ activo   │ [saturado / maduro / virgen]  │
│ CO (ES)      │ X        │ X           │ ✅ activo   │ [saturado / maduro / virgen]  │
└──────────────┴──────────┴─────────────┴─────────────┴───────────────────────────────┘
```

**Cómo leer la señal:**
- US alto + CO bajo = **arbitraje geográfico** — funciona en US, aún no llegó a CO → entrar ahora
- US alto + CO alto = **nicho maduro en CO** — necesitas diferenciador claro
- US bajo + CO bajo = **no validado** — no entrar sin más evidencia
- MX alto + CO bajo = **nicho en camino** — MX anticipa CO por 2-4 meses → ventana abierta

### Paso 1B.3 — Screenshot y metadata por búsqueda

Por cada búsqueda anota:
- Activos y total histórico (con filtro Shopify activo en MX/CO)
- Fecha del anuncio más antiguo visible (longevidad del nicho)
- Fecha del anuncio más reciente (actividad actual)
- Si aparece "X ads use this creative" (señal de escalado activo)
- **Si el copy está en español** → el nicho ya tiene actores locales adaptados
- **Si el copy está en inglés en CO/MX** → campaña global corriendo en LATAM, sin adaptación local → oportunidad

### Paso 1B.4 — Extracción DOM

```javascript
const allDivs = document.querySelectorAll('div');
let adCards = [];
let seenIds = new Set();

for (let div of allDivs) {
  const text = (div.innerText || '').replace(/\u200b/g, '').trim();
  const libMatch = text.match(/Library ID:\s*(\d+)/);
  const hasSponsored = text.includes('Sponsored');
  const hasStarted = text.includes('Started running');
  
  if (libMatch && hasSponsored && hasStarted && text.length > 150 && text.length < 2500) {
    const libId = libMatch[1];
    if (!seenIds.has(libId)) {
      seenIds.add(libId);
      const sponsoredIdx = text.indexOf('Sponsored');
      const beforeSponsored = text.substring(0, sponsoredIdx);
      const lines = beforeSponsored.split('\n').filter(l => l.trim().length > 2);
      const brandName = lines[lines.length - 1] || 'Unknown';
      const adCopy = text.substring(sponsoredIdx + 10, sponsoredIdx + 500).trim();
      const dateMatch = text.match(/Started running on (.+?)(?:\n|$)/);
      adCards.push({
        id: libId,
        brand: brandName.trim(),
        startDate: dateMatch ? dateMatch[1] : 'unknown',
        copy: adCopy.substring(0, 400)
      });
    }
  }
}
JSON.stringify({count: adCards.length, ads: adCards});
```

Si el JS es bloqueado, usa screenshots + zoom para leer copy visible.

### Paso 1B.5 — Scroll y recolección

Scroll 3-5 veces por búsqueda. Objetivo: **mínimo 15-20 anuncios únicos en total** entre las 3 geografías.

---

## FASE 2 — DRILL-DOWN (Profundización en señales fuertes)

### Paso 2.1 — Identificar keywords secundarias del copy

Después de la búsqueda broad, identifica 2-3 keywords más específicas que aparezcan con frecuencia en el copy recolectado:
- Broad: `ejercicio en casa` → Drill-down: `corrector de postura`, `banda de resistencia`, `rueda de abdomen`
- Broad: `bajar de peso` → Drill-down: `grasa abdominal`, `cinturón de sudoración`, `faja moldeadora`
- Broad: `dolor de espalda` → Drill-down: `corrector de postura`, `almohada cervical`, `masajeador de espalda`

### Paso 2.2 — Drill-down en MX y CO (español + Shopify obligatorio)

Para cada keyword de drill-down, ejecuta directamente en MX y CO con filtro Shopify. El drill-down **siempre en español**:

MX:
```
https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=MX&media_type=all&q={KEYWORD_ES}&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc&filter_shopify_only=true
```

CO:
```
https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=CO&media_type=all&q={KEYWORD_ES}&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc&filter_shopify_only=true
```

### Paso 2.3 — Filtro de calidad: solo productos físicos de dropshipping

Al revisar los resultados, **descarta automáticamente** cualquier anuncio de:
- ❌ Apps móviles (Google Play, App Store, "Install now", "Descargar")
- ❌ Cursos, ebooks, membresías, programas digitales
- ❌ Servicios (consultoría, coaching, clínicas)
- ❌ Software o SaaS

**Cuenta solo** anuncios que vendan:
- ✅ Producto físico con envío (gadget, accesorio, suplemento, ropa, hogar, etc.)
- ✅ Tienda Shopify activa con "Shop now", "Comprar ahora", "Pedir ahora"
- ✅ Mencionen envío, contraentrega, domicilio, o precio explícito

### Paso 2.4 — Señales de localización en LATAM

Al revisar cada anuncio en CO/MX, detecta activamente:

| Señal | Significado |
|-------|-------------|
| Copy en español | Actor local o campaña adaptada → competencia directa |
| Copy en inglés en CO/MX | Campaña global sin adaptar → nicho sin explotar localmente |
| "Envío gratis a Colombia" | Dropshipper local activo |
| "Pago contraentrega" | Adaptación total al mercado CO → competidor serio |
| "Entrega en 3-5 días" | Logística local resuelta → nicho viable |
| Precio en COP/MXN | Marca local o adaptada |
| Precio en USD | Marca internacional sin adaptar |

---

## FASE 3 — SCOREBOARD DE PRODUCTOS

Esta es la fase más importante. Por cada producto físico de dropshipping encontrado, asigna un puntaje en dos dimensiones y construye la matriz de priorización.

### Sistema de Puntuación (1-5 por dimensión)

**Dimensión A — POTENCIAL DE MERCADO** (¿qué tan grande y urgente es el dolor?)

| Puntos | Criterio |
|--------|----------|
| 5 | Dolor físico/emocional intenso, recurrente, sin solución satisfactoria clara |
| 4 | Dolor moderado con frustración acumulada, mercado buscando alternativas |
| 3 | Necesidad real pero no urgente, compra impulsiva posible |
| 2 | Deseo más que necesidad, motivación débil |
| 1 | Nicho de curiosidad, sin dolor real detrás |

**Señales que suben el puntaje:** copy emocional intenso, múltiples anunciantes activos >3 meses, variantes activas ("4 ads use this creative"), volumen alto en US (>10,000 activos).

**Dimensión B — COMPETENCIA EN CO** (¿qué tan difícil es entrar?)

| Puntos | Criterio (invertido: más puntos = menos competencia) |
|--------|------------------------------------------------------|
| 5 | 0 anuncios Shopify en CO — nicho virgen |
| 4 | 1-5 anuncios Shopify en CO, todos en inglés (sin adaptación local) |
| 3 | 6-20 anuncios Shopify en CO, mezcla inglés/español |
| 2 | 21-50 anuncios Shopify en CO, varios en español con precio en COP |
| 1 | >50 anuncios Shopify en CO, competidores con "contraentrega", "envío gratis Colombia" |

### Scoreboard

Construye esta tabla con todos los productos físicos encontrados:

```
┌─────────────────────────┬────────────────────────┬───────────┬──────────────┬─────────┬──────────────────┐
│ Producto                │ Dolor que resuelve     │ Potencial │ Competencia  │ Score   │ Veredicto        │
│                         │                        │ (1-5)     │ CO (1-5)     │ A×B     │                  │
├─────────────────────────┼────────────────────────┼───────────┼──────────────┼─────────┼──────────────────┤
│ [producto]              │ [dolor]                │ X         │ X            │ XX      │ [ver tabla]      │
└─────────────────────────┴────────────────────────┴───────────┴──────────────┴─────────┴──────────────────┘
```

**Veredicto por score:**
- Score 20-25 → 🟢 **ATACAR AHORA** — oportunidad de arbitraje clara
- Score 12-19 → 🟡 **EVALUAR** — viable con diferenciador o mejor ángulo
- Score 6-11  → 🟠 **DIFÍCIL** — mercado maduro, necesita ángulo muy específico
- Score 1-5   → 🔴 **DESCARTAR** — saturado o sin demanda real

---

## FASE 4 — ANÁLISIS DE LOS TOP 3 (solo los de score más alto)

Solo los productos con score ≥15 merecen análisis profundo. Para cada uno:

```
PRODUCTO: [nombre]
SCORE: [A×B] — [veredicto]

DOLOR CENTRAL: [descripción exacta, en palabras del mercado]
MECANISMO: [cómo el producto dice que lo resuelve]
VALIDACIÓN US: [N activos, anunciante más longevo desde X fecha]
VALIDACIÓN CO: [N activos Shopify, idioma del copy, precio en COP/USD]
ÁNGULO DOMINANTE: [el hook más repetido entre los anunciantes]
ÁNGULO INEXPLOTADO EN CO: [lo que están haciendo en US que nadie hace en CO]
```

---

## FASE 5 — REPORTE FINAL PRIORIZADO

### Estructura del output — siempre en este orden exacto

```
══════════════════════════════════════════════════════
META ADS SCOUT — MATRIZ DE OPORTUNIDADES
Keywords: [broad EN] → [drill-downs ES]
Fecha: [fecha] | Anuncios físicos procesados: [N]
══════════════════════════════════════════════════════

## SCOREBOARD COMPLETO

[Tabla de todos los productos con puntuación A×B]

---

## 🟢 OPORTUNIDADES PARA ATACAR AHORA

### #1 — [Producto] (Score: XX/25)

**El dolor:** [descripción en lenguaje del mercado]
**El producto:** [descripción física concreta]
**Por qué CO es virgen:** [evidencia — cuántos Shopify activos, idioma del copy]
**Ángulo de entrada recomendado:** [hook específico adaptado a CO]
**Copy de gancho sugerido (español):** "[ejemplo concreto]"
**Señal de validación más fuerte:** [dato específico — ej: "anunciante activo 8 meses con 4 variantes en US"]

### #2 — [Producto] (Score: XX/25)
[misma estructura]

---

## 🟡 EN EVALUACIÓN (requieren diferenciador)

### [Producto] (Score: XX/25)
**Por qué no es fácil:** [razón concreta]
**Cómo entrar de todas formas:** [diferenciador posible]

---

## ❌ DESCARTADOS
[Lista rápida con razón en una línea por producto]

---

## ACCIÓN INMEDIATA RECOMENDADA
1. [paso concreto con producto, keyword y mercado específico]
2. [segundo paso]
══════════════════════════════════════════════════════
```

---

## NOTAS DE OPERACIÓN

**Si el JavaScript de extracción es bloqueado:** usa screenshots + zoom para leer copy visible.

**Si Meta muestra CAPTCHA o login wall:** detente y notifica al usuario — no intentes evadir.

**Rate limiting:** espera 2-3 segundos entre scrolls; recarga la URL si los resultados no cargan.

**Criterios mínimos para emitir reporte:**
- [ ] Mínimo 10 productos físicos únicos evaluados (descartando apps y digitales)
- [ ] Las 3 geografías cubiertas (US, MX, CO) con filtro Shopify en MX/CO
- [ ] Al menos 1 drill-down en español ejecutado en CO
- [ ] Scoreboard completo con todos los productos rankeados
