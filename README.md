# Cinquantino GPS

App web static client-side per navigazione 50cc in Italia.

## Sviluppo locale

```bash
npm install
npm run dev
```

## Deploy su Render

- Crea un nuovo **Static Site**
- Collega questo repository
- Il file `render.yaml` usa:
  - `buildCommand`: `npm ci && npm run build`
  - `staticPublishPath`: `dist`
  - rewrite SPA da `/*` a `/index.html`
- Imposta la variabile ambiente `VITE_ORS_API_KEY` con la tua chiave OpenRouteService

## Note

- L'app resta completamente client-side.
- La chiave ORS viene usata dal browser, quindi è visibile nel frontend pubblicato.
- Per una navigazione corretta, abilita il permesso GPS nel browser.
