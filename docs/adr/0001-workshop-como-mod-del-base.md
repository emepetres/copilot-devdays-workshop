# El workshop es un mod del workshop base, no un workshop nuevo

El workshop se ejecuta sobre el **workshop base** (pista VS Code de *Real-world development*, Tailspin Toys) tal cual: sus prerrequisitos, su repo plantilla y sus lecciones, sin traducir ni reescribir. Este repo solo publica el **mod**, en inglés (en-US) para encajar con la base: **lecciones propias** intercaladas o sustitutas, **prerrequisitos extra** y el material que traen por comando. Así se reduce el riesgo a 4 días del evento: la base está revisada y probada, y solo hay que revisar y ensayar lo propio. Se adoptan también sus exigencias de plan (Copilot Student o superior; Free no se soporta).

## Considered Options

- **Workshop propio derivado** (diseño del mapa #1): plantilla propia, lección 0 propia y lecciones base traducidas al español. Se descarta porque obliga a revisar y ensayar todo el workshop, no solo lo añadido.

## Consequences

- Se retiran la plantilla `emepetres/tailspin-toys-devdays`, la lección 0 propia y la lección 1 traducida.
- Las lecciones base quedan en inglés, y las lecciones propias se escriben también en inglés.
- El entorno de referencia es el de la base (Codespaces); las lecciones propias funcionan igual en local, que es lo que se recomienda en la sesión.
