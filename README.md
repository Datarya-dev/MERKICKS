# MERKICKS

Showroom estático de MERKICKS: portada con seis destacados, catálogo filtrable por marca y 212 fichas con fotografías y enlaces de contacto por WhatsApp.

## Desarrollo local

Requiere Node.js 20 o posterior. No hay dependencias externas.

```sh
npm run build
npm run check
npm run dev
```

Abre `http://127.0.0.1:4173`. El servidor local solo sirve la carpeta generada `dist/`.

## Cloudflare Pages

Conecta este repositorio como proyecto Pages y usa:

| Campo | Valor |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` |
| Root directory | raíz del repositorio |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js | versión 20 o posterior |

No hay secretos ni variables obligatorias para el primer despliegue. Una vez conocida la URL definitiva, define `SITE_ORIGIN` con la URL HTTPS completa sin barra final (por ejemplo, `https://ejemplo.pages.dev`) en las variables de entorno de producción de Pages. El build generará las URL canónicas, metadatos Open Graph completos y `sitemap.xml`. Después, vuelve a desplegar.

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
