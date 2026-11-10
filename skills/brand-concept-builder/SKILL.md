---
name: brand-concept-builder
description: "Construye el concepto completo de una marca desde cero: posicionamiento diferenciado, personalidad, dirección visual (paleta, tipografía, estética), tono de comunicación y canales prioritarios. Usa este skill siempre que el usuario quiera crear una marca, darle identidad a un emprendimiento, definir el concepto visual o verbal de un negocio, o necesite pasar de 'tengo un producto' a 'tengo una marca'. Activa cuando el usuario diga 'quiero crear una marca de X', 'ayúdame con el concepto de mi marca', 'cómo debería llamarse', 'dame una paleta de colores', 'define el tono de mi marca', 'qué canales usar para X', o cualquier solicitud de brand identity, brand strategy o brand kit básico. También activa como segundo paso del flujo cali-market-scout cuando el usuario tiene una hipótesis de diferenciación y quiere construir el concepto de marca sobre ella. SIEMPRE usa este skill para cualquier tarea de construcción de identidad de marca."
---

# Brand Concept Builder

Skill de construcción de concepto de marca. Toma un producto, nicho, e hipótesis de diferenciación (puede venir de `cali-market-scout` o del usuario directamente) y construye una identidad de marca completa y coherente.

---

## Input esperado

El skill funciona con cualquiera de estos inputs:

**Input mínimo:** nombre del producto o categoría
**Input ideal:** producto + hipótesis de diferenciación (output de `cali-market-scout`)
**Input completo:** producto + hipótesis + segmento objetivo + referencias de estética que le gustan al usuario

Si el usuario solo da el producto, el skill genera la hipótesis internamente o pregunta UNA sola vez por el diferenciador principal.

---

## Proceso de ejecución

### Paso 1 — Investigación visual y de referentes

Usa `web_search` para investigar:
1. `[producto] brand identity diseño minimalista/artesanal/premium [según nicho]`
2. `[producto] marca exitosa latinoamérica concepto`
3. `[categoría] color palette brand [año]`
4. Referencias de marcas globales del nicho para identificar convenciones visuales a romper o adoptar

El objetivo: saber qué se ve igual en el mercado para deliberadamente diferenciarse.

---

### Paso 2 — Construcción del concepto

Sigue este orden de construcción (cada capa informa la siguiente):

1. **Posicionamiento** → quién eres y para quién
2. **Personalidad** → cómo te comportas
3. **Nombre** → cómo te llamas
4. **Visual** → cómo te ves
5. **Voz** → cómo hablas
6. **Canales** → dónde vives

---

### Paso 3 — Estructura del output

---

## 🎨 BRAND CONCEPT — [PRODUCTO/NOMBRE TENTATIVO]

### 1. Posicionamiento de marca

**Statement de posicionamiento:**
> "[Marca] es la única [categoría] para [segmento] que [beneficio diferencial], porque [razón para creer]."

**Territorio de marca:** (1 línea que define el espacio conceptual que ocupa)
Ejemplo: "Donde la tradición japonesa se encuentra con el paladar urbano caleño."

**Arquetipo de marca:** (1 arquetipo de Jung + justificación de 2 líneas)
Opciones: El Creador, El Explorador, El Rebelde, El Sabio, El Mago, El Inocente, El Héroe, El Cuidador, El Bufón, El Amante, El Gobernante, El Forastero

---

### 2. Personalidad de marca

5 adjetivos que definen la marca (no genéricos como "innovador" o "auténtico"):
- [Adjetivo específico]: [qué significa en comportamiento concreto]
- [Adjetivo específico]: [qué significa en comportamiento concreto]
- (x5)

**Lo que la marca NUNCA sería:** 3 adjetivos opuestos que delimitan la identidad

---

### 3. Propuesta de nombre

Presenta **3 opciones de nombre** con estructura:

#### Opción A — [Nombre]
- **Lógica del nombre:** por qué funciona para este concepto
- **Disponibilidad estimada:** .com / Instagram / dominio .co (indicar si hay que verificar)
- **Potencial de marca:** qué tan escalable y memorable es
- **Tagline sugerido:** (máximo 5 palabras)

#### Opción B — [Nombre]
(misma estructura)

#### Opción C — [Nombre]
(misma estructura)

**Recomendación:** cuál de las 3 y por qué.

---

### 4. Dirección visual — Brand Kit

#### Paleta de colores

Presenta una paleta de 4-5 colores con:

| Rol | Color | HEX | Uso principal |
|---|---|---|---|
| Primario | [nombre descriptivo] | #XXXXXX | [uso] |
| Secundario | [nombre descriptivo] | #XXXXXX | [uso] |
| Acento | [nombre descriptivo] | #XXXXXX | [uso] |
| Neutro claro | [nombre descriptivo] | #XXXXXX | [uso] |
| Neutro oscuro | [nombre descriptivo] | #XXXXXX | [uso] |

**Lógica de la paleta:** por qué estos colores para este posicionamiento (psicología del color aplicada al nicho, no genérica)

**Lo que evitar:** colores que usan los competidores principales (para diferenciarse)

#### Tipografía

| Rol | Familia tipográfica | Estilo | Uso |
|---|---|---|---|
| Display / Logo | [fuente] | [weight] | Títulos, logo |
| Body | [fuente] | [weight] | Textos corridos |
| Accent (opcional) | [fuente] | [weight] | Citas, detalles |

Todas las fuentes deben ser gratuitas (Google Fonts) o indicar si son de pago.

#### Estética y moodboard textual

Describe la dirección visual en 5 dimensiones:
- **Fotografía:** [qué tipo de imágenes, luz, composición, props]
- **Ilustración / gráficos:** [si aplica — estilo, grosor de línea, nivel de detalle]
- **Layout:** [cómo se organizan los elementos — limpio, denso, asimétrico, centrado]
- **Textura / materialidad:** [si la marca tiene elementos táctiles — papel, empaque, superficie]
- **Referencias visuales:** 3 marcas reales cuya estética tiene elementos que debería referenciar (no copiar)

---

### 5. Voz y tono de comunicación

**Cómo habla la marca:**
- Persona gramatical: (tú / usted / vos — justificado para Cali)
- Registro: (formal / coloquial / técnico / poético)
- Longitud de mensajes: (corto e impactante / narrativo / informativo)

**3 ejemplos de copy en voz de marca:**
1. Caption para Instagram post de producto
2. Respuesta a un comentario negativo en redes
3. Descripción del producto en punto de venta físico

---

### 6. Estrategia de canales

| Canal | Rol en la estrategia | Contenido prioritario | Frecuencia sugerida |
|---|---|---|---|
| [Canal 1] | [rol: awareness/conversión/comunidad] | [tipo de contenido] | [frecuencia] |
| [Canal 2] | ... | ... | ... |
| [Canal 3] | ... | ... | ... |

**Canal de lanzamiento recomendado:** uno solo, con justificación. ¿Por qué empezar ahí?

**Canal a ignorar al inicio:** uno solo, con justificación. ¿Por qué no todavía?

---

### 7. Concepto de lanzamiento

Una idea de lanzamiento que sea:
- Ejecutable con presupuesto bajo (< $500 USD)
- Coherente con el posicionamiento
- Específica para Cali (lugar, comunidad, evento, o momento cultural local)

---

## Reglas de calidad

- **Sin paletas genéricas**: nada de "azul para confianza, verde para naturaleza" sin contexto del nicho
- **Nombres reales**: no inventar nombres imposibles de pronunciar o que ya existen como marca registrada obvio
- **Canales justificados**: nunca recomendar "estar en todas las redes" — priorizar con criterio
- **Voz testeable**: los 3 ejemplos de copy deben sonar humanos y distintos entre sí
- **Coherencia interna**: paleta + tipografía + estética + voz deben contar la misma historia
- **Cali-aware**: si el producto es para Cali, la estrategia de canales y lanzamiento debe reflejarlo — no puede ser un plan genérico de Colombia

---

## Integración con otros skills

**Viene de:** `cali-market-scout` (hipótesis de diferenciación como input)
**Alimenta:** `copy-post-writer` (voz y tono como contexto), `ecommerce-prompt-builder` (dirección visual como brief)

Al finalizar, si el usuario quiere generar contenido visual o copy, pasar las secciones 4 y 5 como contexto a esos skills.
