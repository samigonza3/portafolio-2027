# Bandeja ChateaPro

Bandeja propia sobre la API de ChateaPro, con el estilo de samuelgonzalez.org. Sin dependencias ni paso de build: archivos estáticos más una función de Netlify que guarda el token.

## Qué hace

Lista las conversaciones (con filtros por búsqueda, ventana de 24 h, canal, etiqueta y estado abierto), muestra el hilo completo con notas privadas, permite responder, cambiar el estado (abierto, pendiente, resuelto, spam), asignar agente, pausar o reanudar el bot y manejar etiquetas. El panel de la izquierda muestra chats de hoy, chats de 7 días con gráfica y conteo por estado.

## Deploy en Netlify

1. Sube esta carpeta a GitHub (puede ir dentro del repo del portafolio).
2. En Netlify: Add new site, Import from Git. Si está dentro del repo del portafolio, en Base directory escribe `bandeja-chateapro`.
3. Build command: vacío. Publish directory: `public`. Functions directory: `netlify/functions` (ya lo declara netlify.toml).
4. En Site configuration, Environment variables, crea:
   CHATEAPRO_TOKEN con tu token de API (scopes Gestionar el flujo y Gestionar equipo).
   APP_PASSWORD con la clave con la que vas a entrar (obligatoria, protege tus chats).
5. Deploy. Si quieres un subdominio como bandeja.samuelgonzalez.org, agrégalo en Domain management.

Sin CHATEAPRO_TOKEN la bandeja abre en modo demostración con datos de ejemplo, útil para ver el diseño.

## Probar en local

```
npm run dev     # http://localhost:8888, lee .env si existe
npm test        # prueba de humo contra una API simulada
```

## Notas de la API

El token nunca llega al navegador: todo pasa por `netlify/functions/api.mjs`, que además exige la clave y bloquea peticiones sin sesión. La lista de chats sale de GET /subscribers, el estado abierto de /flow/conversations/data y las métricas de /flow/bot-users-count. ChateaPro no devuelve el texto del último mensaje en la lista, por eso solo se ve al abrir el chat. Si las horas se ven corridas, ajusta UPSTREAM_TZ_OFFSET_HOURS (por defecto 0, es decir UTC).
