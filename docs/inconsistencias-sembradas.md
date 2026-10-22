# Clave de respuestas: inconsistencias sembradas 4–6

Las **inconsistencias sembradas** de los documentos que revisa el **Engineering Reviewer** en la lección 6. Es la base de la solución plegable de esa lección y **no va en la plantilla del workshop**. Las inconsistencias 1–3 son las del diagrama (apartado 6 de `workshop-design.md`).

La evidencia se cita por fichero y símbolo, no por línea, porque las lecciones 2 y 3 cambian el código de la plantilla. Ninguna de esas lecciones toca la evidencia: el filtrado y la ordenación no cambian el esquema, la salida estática ni la escala de las valoraciones.

| # | Documento | Ubicación | Inconsistencia | Evidencia en el código |
|---|---|---|---|---|
| 4 | `docs/requisitos.pdf` | Pág. 1, apartado 3, **RF-03**: «Un juego puede pertenecer a varias categorías. La tarjeta y la página de detalle muestran todas las categorías del juego.» (RF-02 y RF-05 también hablan de «las categorías») | Requisito funcional ↔ modelo de datos: cada juego tiene **una sola** categoría | `db/schema.ts`: `games.categoryId` es una única clave ajena `notNull()` a `categories`, sin tabla intermedia. `src/types/game.ts`: `Game.category: Category \| null`. `src/lib/games.ts`: `baseGamesQuery` hace un único `leftJoin` con `categories`. `db/games.csv`: una sola columna `Category` por juego |
| 5 | `docs/requisitos.pdf` | Pág. 1, apartado 4, **RNF-01**: «El catálogo se actualiza en tiempo real: cualquier cambio en los datos de un juego se ve en la web en menos de 5 segundos, sin volver a desplegar el sitio.» | Requisito no funcional ↔ arquitectura: el sitio es estático y los datos se leen **solo al compilar** | `astro.config.mjs`: `output: 'static'`. `src/pages/index.astro` y `src/pages/game/[id].astro`: `export const prerender = true` y consultas en el frontmatter. `package.json`: `prebuild` ejecuta `db:setup`, que carga `db/games.csv`. `README.md`: «there is no live data». Cualquier cambio exige volver a compilar y desplegar |
| 6 | `docs/acta-reunion.pdf` (escaneado, requiere OCR) | Única página, apartado «Decisiones», **D2**: «La valoración de los juegos se muestra en una escala de 1 a 10, con números enteros y sin estrellas. Implementado en el sprint 14.» | Decisión del acta ↔ implementación: la valoración sigue en **0–5 con estrellas y un decimal** | `src/lib/ratings.ts`: `clampRating` limita a 0–5 y `formatStarRating` dibuja cinco posiciones de estrella (★, ½, ☆). `src/components/StarRating.astro`: muestra las estrellas y `toFixed(1)`. `db/transforms.ts`: `ratingFromTitle` genera valores en [3.0, 5.0] con un decimal |

## Lo que no es una inconsistencia

El resto del contenido coincide con el código a propósito. Si el informe marca algo de esto, es un falso positivo:

- **Requisitos**: RF-01, RF-04 y RF-06 a RF-09; RNF-02 a RNF-06. El apartado 5 deja fuera de alcance la búsqueda, el filtrado, la ordenación y la paginación, así que el filtrado y la ordenación de las lecciones 2 y 3 no contradicen el documento.
- **Código de las lecciones 2 y 3**: el informe puede decir que el código implementa funciones que el apartado 5 deja fuera de la versión 1.2. Es razonable, pero no es una de las inconsistencias sembradas. RF-01 (orden alfabético por título) solo se mantiene si la ordenación de la lección 3 conserva A–Z como orden por defecto. La evidencia de la inconsistencia 5 supone que el filtrado sigue siendo estático, como pide `astro.instructions.md`, y no pasa a SSR.
- **Acta**: D1 (se mantiene SQLite) y D3 (el botón «Support This Game» no tramita aportaciones) coinciden con el código. La acción de actualizar la especificación con D2 indica que la decisión es posterior al PDF de requisitos, que no fija ninguna escala de valoración.

## Regenerar los documentos

Las fuentes editables están en `docs/assets/`. Desde la raíz de este repo, con la plantilla clonada en `../tailspin-toys-devdays`:

```sh
uv run docs/assets/generate-requisitos-pdf.py ../tailspin-toys-devdays/docs/requisitos.pdf
uv run docs/assets/generate-acta-scan.py ../tailspin-toys-devdays/docs/acta-reunion.pdf
node docs/assets/convert-seeded-docs.mjs ../tailspin-toys-devdays
```

El último paso necesita `docling-mcp-server` (lección 0). Convierte ambos documentos con Docling en local, deja el Markdown del plan B en `docs/reviews/_docling/` de la plantilla y falla si el texto sembrado no aparece en la conversión, incluido el OCR del acta. Si cambias el texto sembrado, actualiza también las frases que comprueba el script y esta clave.
