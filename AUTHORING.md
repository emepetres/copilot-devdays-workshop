# Guía para autores

Este repo publica el **mod** del workshop base ([ADR 0001](docs/adr/0001-workshop-como-mod-del-base.md)). Las lecciones propias se escriben en Markdown en `lessons/` y se leen directamente en GitHub. El sitio Astro + Starlight de `website/` las publica en <https://emepetres.github.io/copilot-devdays-workshop/>.

Las lecciones, el sitio y el material del mod van **en inglés (en-US)**, para encajar con la base. No hay i18n. La descripción pública, el diseño, el glosario y las issues siguen en español.

```
lessons/
├── README.md               ← portada del sitio (slug: index)
├── pocock-workflow.md      ← una lección por fichero; el nombre fija la URL
├── ...
└── _images/                ← imágenes (las carpetas con _ no se publican como páginas)
website/
├── astro.config.mjs        ← base, barra lateral (manual)
├── src/content.config.ts
└── src/styles/custom.css
mod/lessons/<name>/         ← material de cada lección, tal cual queda en el repo del asistente
```

La portada (`lessons/README.md`) explica qué es el mod y muestra el itinerario: el diagrama (`_images/itinerary-horizontal.svg` y su versión móvil `itinerary-vertical.svg`) y la lista numerada. Si cambia el itinerario, actualiza los tres a la vez, además de la barra lateral. La descripción pública de Luma (`docs/public-description.md`) es un texto aparte, en español.

## Añadir una lección

1. Crea `lessons/<slug>.md`, con un slug en inglés y **sin número** (el orden lo fija el itinerario, no el nombre). Lleva frontmatter; solo `title` es obligatorio y se muestra como H1, así que no añadas otro H1 en el cuerpo:
   ```markdown
   ---
   title: "Matt Pocock's workflow"
   ---
   ```
2. Empieza con la línea "Do this after *Exercise N · …*" (o la lección propia anterior), enlazada, y un recuadro "Where you should be" con la rama y el estado esperado.
3. Regístrala en `sidebar` de `website/astro.config.mjs`, en su sitio del itinerario. La barra lateral se mantiene a mano y el orden del fichero es el que ve el asistente. Los ejercicios de la base se añaden con `baseExercise()`, que enlaza al sitio publicado de la base.
4. Enlaza otras lecciones propias por su ruta publicada, no por el `.md`: `[Matt Pocock's workflow](../pocock-workflow/)`. Los ejercicios de la base, por su URL absoluta en <https://github-samples.github.io/copilot-workshops/real-world-development/vscode/>. Las imágenes, en cambio, se enlazan desde el fichero fuente: `![Alt text](_images/screenshot.png)`.
5. Para avisos usa la sintaxis de GitHub; el sitio la convierte en avisos de Starlight:
   ```markdown
   > [!NOTE]
   > NOTE, TIP, IMPORTANT, WARNING o CAUTION.
   ```

## Material del mod

Lo que una lección necesita en el repo del asistente (skills, documentos, diagramas…) no se pega en la lección: va en `mod/lessons/<name>/`, con la misma ruta con la que debe quedar en Tailspin Toys, y llega con el CLI del mod (`setup` o `lesson <name>`). Ver §5 de [`docs/workshop-design.md`](docs/workshop-design.md).

## Solución plegable

Usa `<details>`, que se pliega igual en GitHub y en el sitio. Deja una línea en blanco tras `<summary>` para que el Markdown de dentro se procese:

```markdown
<details>
<summary>Solution</summary>

The solution, in Markdown.

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
