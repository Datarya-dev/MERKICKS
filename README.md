# MERKICKS

Showroom estático de MERKICKS: portada con seis destacados, catálogo filtrable por marca y 212 fichas con fotografías y enlaces de contacto por WhatsApp.

## Desarrollo local

Requiere Node.js 20 o posterior. No hay dependencias externas.

```sh
npm run build
npm run check
npm run dev
```

Abre `http://127.0.0.1:4173/MERKICKS/`. El servidor local sirve la carpeta generada `dist/` bajo el mismo prefijo que GitHub Pages.

## GitHub Pages

La URL pública prevista es `https://datarya-dev.github.io/MERKICKS/`. El workflow `.github/workflows/pages.yml` genera `dist/`, comprueba las 212 fichas y publica el artefacto en cada push a `main`.

En **Settings → Pages → Build and deployment → Source**, selecciona **GitHub Actions** si GitHub aún no lo ha habilitado. El repositorio privado necesita un plan de GitHub que admita Pages privadas. No es necesario configurar una rama `gh-pages` ni publicar `dist/` en Git.

`SITE_ORIGIN` está definido en el workflow con la URL pública prevista; `site.config.json` contiene la misma URL como valor local. El generador crea canonical URLs, metadatos Open Graph y `sitemap.xml` bajo `/MERKICKS/`.

No publiques la carpeta `public/` directamente: contiene solo los recursos base. `npm run build` genera `dist/` con la portada, todas las fichas y los recursos.

## Estructura

- `data/catalog.json`: modelos y sus fotos optimizadas.
- `data/scenes.json`: configuración de los seis destacados.
- `public/products/`: 512 fotos únicas en tres tamaños WebP, incluidas en el repositorio para que el build sea reproducible sin servicios externos.
- `merkicks-original.svg`: logo original usado por el sitio.
- `src/`: estilos y comportamiento.
- `scripts/build.mjs`: genera los HTML estáticos y metadatos.
- `scripts/check.mjs`: comprueba rutas, recursos y enlaces.
- `scripts/serve.mjs`: vista previa local.

Para añadir o retirar productos, actualiza `data/catalog.json` y los WebP correspondientes. Antes de desplegar una versión que retire fichas, elimina `dist/` localmente y vuelve a construir para evitar rutas antiguas durante la revisión; Cloudflare parte de un checkout limpio.
