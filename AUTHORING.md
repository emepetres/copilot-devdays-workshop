# Guía para autores

Las lecciones se escriben en Markdown en `lessons/` y se leen directamente en GitHub. El sitio Astro + Starlight de `website/` las publica en <https://emepetres.github.io/copilot-devdays-workshop/>. Solo en español: no hay i18n.

```
lessons/
├── README.md            ← portada del sitio (slug: index)
├── 0-prerrequisitos.md  ← una lección por fichero; el nombre fija la URL
├── ...
└── _images/             ← imágenes (las carpetas con _ no se publican como páginas)
website/
├── astro.config.mjs     ← base, barra lateral (manual)
└── src/content.config.ts
```

La portada copia el texto de `docs/public-description.md`. Si cambias la descripción pública, actualiza también `lessons/README.md`.

## Añadir una lección

1. Crea `lessons/N-nombre.md` con frontmatter. Solo `title` es obligatorio y se muestra como H1, así que no añadas otro H1 en el cuerpo:
   ```markdown
   ---
   title: "Lección N · Título"
   ---
   ```
2. Regístrala en `sidebar` de `website/astro.config.mjs`. La barra lateral se mantiene a mano y el orden del fichero es el que ve el asistente.
3. Enlaza otras lecciones por su ruta publicada, no por el `.md`: `[lección 2](../2-agent-mode/)`. Las imágenes, en cambio, se enlazan desde el fichero fuente: `![Texto alternativo](_images/captura.png)`.
4. Para avisos usa la sintaxis de GitHub; el sitio la convierte en avisos de Starlight:
   ```markdown
   > [!NOTE]
   > NOTE, TIP, IMPORTANT, WARNING o CAUTION.
   ```

## Solución plegable

Usa `<details>`, que se pliega igual en GitHub y en el sitio. Deja una línea en blanco tras `<summary>` para que el Markdown de dentro se procese:

```markdown
<details>
<summary>Solución</summary>

El contenido de la solución, en Markdown.

</details>
```

## Previsualizar en local

```sh
cd website
npm install
npm run dev      # http://localhost:4321/copilot-devdays-workshop/
```

Antes de abrir la PR, comprueba lo mismo que CI (`.github/workflows/pages.yml`): `npm run check` y `npm run build`. En CI además se comprueban offline los enlaces internos con lychee. Si un cambio no se refleja, borra la caché con `rm -rf .astro node_modules/.astro`.

## Publicación

Cada push a `main` despliega el sitio en GitHub Pages. Requiere que el repo sea público y que Pages tenga como origen **GitHub Actions** (Settings → Pages → Source).
