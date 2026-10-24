---
title: "Lección 1 · Custom instructions"
---

**Objetivo:** dar contexto al agente con `copilot-instructions.md` e `instructions/*.md`.

El contexto es fundamental al trabajar con IA generativa. Si una tarea debe realizarse de una forma concreta, o hay información de fondo que Copilot debería conocer, conviene que ese contexto esté a su alcance. Hay varias formas de compartir contexto específico con Copilot. La principal son los [archivos de instrucciones][instruction-files], que es como proporcionas esas directrices sobre la generación de código.

En esta lección:

- explorarás cómo llegan a Copilot el contexto específico del proyecto, las directrices de programación y los estándares de documentación mediante las instrucciones personalizadas del repo y los archivos de instrucciones limitados por ruta.
- generarás la primera parte de datos para el filtrado (una función auxiliar de editores) con las instrucciones *actuales*.
- añadirás un nuevo estándar para todo el repo en `.github/copilot-instructions.md`.
- volverás a ejecutar el mismo prompt y verás cómo el código generado adopta el nuevo estándar.
- harás commit de la actualización de las instrucciones y de la parte de filtrado en `main` para que Copilot pueda usar las directrices actualizadas en la siguiente lección.

> [!CAUTION]
> El código generado puede desviarse de algunos de los estándares que establezcas. Copilot no es determinista. El objetivo de esta lección es ver la *tendencia* del cambio de comportamiento tras actualizar las instrucciones, no obtener una salida idéntica carácter a carácter.

## Archivos de instrucciones

### Escenario

Como cualquier buen equipo de desarrollo, Tailspin Toys dispone de directrices y requisitos para las prácticas de desarrollo. Entre ellos se incluyen:

- La capa de datos siempre necesita pruebas unitarias.
- La interfaz de usuario debe estar en modo oscuro y tener un aspecto moderno.
- La documentación debe añadirse al código en forma de comentarios de documentación TSDoc.
- Debe añadirse un bloque de comentarios al principio de cada archivo que describa lo que hace el archivo.

Mediante los archivos de instrucciones, garantizarás que Copilot disponga de la información adecuada para realizar las tareas conforme a las prácticas indicadas.

### Instrucciones personalizadas

Las instrucciones personalizadas permiten proporcionar contexto y preferencias a Copilot para que comprenda mejor el estilo y los requisitos de programación. Esta potente funcionalidad ayuda a orientar a Copilot para obtener sugerencias y fragmentos de código más pertinentes. Puedes especificar las convenciones de programación, las bibliotecas e incluso los tipos de comentarios que prefieres incluir en el código. Puedes crear instrucciones para todo el repo o para tipos de archivo concretos, con contexto a nivel de tarea.

Hay dos tipos de archivos de instrucciones:

- `.github/copilot-instructions.md`, un único archivo de instrucciones que se envía a Copilot con **cada** solicitud del repo. Debe contener información del proyecto: contexto pertinente para la mayoría de las solicitudes de chat o CLI enviadas a Copilot. Puede incluir la pila tecnológica, una descripción general de lo que se está creando, procedimientos recomendados y otras directrices globales.
- Los archivos `.github/instructions/*.instructions.md` se pueden crear para tareas o tipos de archivo concretos. Puedes utilizarlos para proporcionar directrices para lenguajes específicos, como TypeScript o Astro, o para tareas como crear un componente de interfaz de usuario o un nuevo conjunto de pruebas unitarias.

> [!NOTE]
> Cuando trabajas en el IDE, los archivos de instrucciones solo se usan para la generación de código en Copilot Chat, no para las finalizaciones de código ni para las sugerencias de la siguiente edición.
>
> Copilot Chat, Copilot CLI y el agente en la nube de Copilot usan tanto los archivos del repo como los archivos `*.instructions.md` (con `applyTo` en el front matter) al generar código.
>
> Por último, Copilot [admite archivos de instrucciones de otros estándares][custom-instructions-support], como los archivos AGENTS.md y CLAUDE.md.

### Procedimientos recomendados para gestionar los archivos de instrucciones

Una explicación completa sobre cómo crear archivos de instrucciones queda fuera del alcance del workshop. Sin embargo, los ejemplos del proyecto de muestra reflejan un enfoque representativo. A grandes rasgos:

- Centra las instrucciones de `copilot-instructions.md` en directrices del proyecto, como una descripción de lo que se está creando, la estructura del proyecto y los estándares de programación globales.
- Usa archivos `*.instructions.md` para dar instrucciones específicas para tipos de archivo (pruebas unitarias, componentes de Astro, la capa de datos) o para tareas concretas.
- Usa lenguaje natural. Mantén las directrices claras. Incluye ejemplos de cómo debe (y no debe) ser el código.

No hay una única forma de crear archivos de instrucciones, igual que no hay una única forma de usar la IA. Mediante la experimentación descubrirás qué funciona mejor para tu proyecto.

> [!TIP]
> Todo proyecto que use GitHub Copilot debería tener una colección sólida de archivos de instrucciones. Al explorar los de este proyecto, puede que observes que hay archivos para numerosos tipos de tareas, como las [actualizaciones de la interfaz de usuario][ui-instructions] y [Astro][astro-instructions].
>
> Copilot también puede ayudarte a generar archivos de instrucciones. En VS Code, usa **Configure Chat → Generate Agent Instructions**.
>
> ¿Buscas plantillas o un punto de partida? Explora [awesome-copilot][awesome-copilot], un repo lleno de archivos de instrucciones, custom agents y otros recursos.

## Explorar los archivos de instrucciones personalizadas del proyecto

Dedica un momento a leer los archivos de instrucciones que incluye este repo: hay un archivo principal, `copilot-instructions.md`, y una colección de archivos `*.instructions.md` para distintas tareas. Ábrelos en el editor o en la interfaz web de GitHub.

1. Abre `.github/copilot-instructions.md`.
2. Explora el archivo. Observa la breve descripción del proyecto y secciones como **Agent notes**, **Code standards**, **npm Commands** y **Repository Structure**. En **Code standards**, fíjate en las directrices anidadas de **GitHub Actions workflows**. Se aplican a cualquier interacción con Copilot.
3. Abre la carpeta `.github/instructions` y explora los archivos. Observa que hay instrucciones para archivos de Astro, la capa de datos de Drizzle, pruebas y otros elementos.
4. Abre `.github/instructions/unit-tests.instructions.md`. Observa el campo `applyTo` de la parte superior: establece un patrón glob, relativo a la raíz del repo, que determina a qué archivos se aplican las instrucciones. En este caso, coincidirá cualquier archivo de prueba de TypeScript, por ejemplo, uno que cumpla `**/*.test.ts`.
5. Examina las instrucciones específicas para crear pruebas unitarias en este proyecto.
6. Por último, abre `.github/instructions/drizzle.instructions.md` y desplázate hasta el final. Observa los vínculos a otros archivos de instrucciones, como `unit-tests.instructions.md`, y a archivos existentes del proyecto. De este modo puedes dividir conjuntos de instrucciones grandes en archivos más pequeños y reutilizables, y señalar a Copilot ejemplos que debe seguir al generar código. Las rutas de ese archivo son relativas al archivo de instrucciones, no a la raíz del repo.

> [!NOTE]
> La sección **Code formatting requirements** de `copilot-instructions.md` documenta los estándares de programación del proyecto, pero todavía no exige documentación en el código. En los pasos siguientes, añadirás reglas para los comentarios de documentación TSDoc y los encabezados de comentario de los archivos.

## Crear una rama para los cambios

Sigamos los procedimientos recomendados y creemos una rama para los cambios.

1. Abre en VS Code la carpeta de tu repo, la que clonaste en la lección anterior.
2. Abre una terminal nueva pulsando <kbd>Ctrl</kbd>+<kbd>\`</kbd> (también en macOS).
3. Crea una rama nueva y cámbiate a ella:

   ```bash
   git checkout -b custom-instructions
   ```

## Usar Copilot Chat *antes* de actualizar las instrucciones

> [!TIP]
> **Abre Copilot Chat**
>
> Antes de empezar los ejercicios siguientes, vuelve a VS Code, abre el panel de Copilot Chat y selecciona **New Chat** para empezar una conversación limpia. La selección de modo varía en cada lección; cada paso lo indica donde importa. Como modelo, usa siempre **Auto**.

Para ver el efecto de las instrucciones personalizadas, empieza enviando un prompt con el archivo de instrucciones actual. Después lo actualizarás y volverás a enviar el mismo prompt para ver la diferencia.

1. Cierra las pestañas del editor que tengas abiertas de lecciones anteriores para que Copilot tome solo el contexto que quieres.
2. Abre la carpeta `src/lib` en el explorador. Ahí irá la función auxiliar, en `src/lib/publishers.ts`, que todavía no existe: la creará Copilot.
3. Selecciona **Agent** en el desplegable de agentes de la vista Chat para que Copilot pueda aplicar cambios en los archivos.

   ![Captura del selector de agente en la vista Chat.](_images/chat-agent-selector.png)

4. Envía el siguiente prompt:

   ```plaintext
   Create or update src/lib/publishers.ts with a data-access helper that returns a list of all publishers with the name and id for each. Apply the file changes.
   ```

5. Copilot explora el proyecto y aplica actualizaciones de código, que a menudo abarcan el archivo de la función auxiliar y sus pruebas.
6. Observa que la función auxiliar propuesta es una función tipada que recibe un cliente `db` como primer argumento y devuelve una matriz tipada de editores. Esto procede de las convenciones de la capa de datos de `.github/instructions/drizzle.instructions.md` (que se aplica a `src/lib/*.ts`).
7. Observa que al código propuesto **le faltan** los comentarios de documentación TSDoc y un encabezado de comentario a nivel de archivo.

> [!CAUTION]
> Como Copilot es probabilístico, es posible que añada comentarios de documentación aunque no se le haya indicado. Si ocurre, no pasa nada: lo importante sigue siendo la mejora de *coherencia* tras actualizar las instrucciones.

## Añadir un nuevo estándar del repo

Como se ha indicado antes, `.github/copilot-instructions.md` está pensado para proporcionar a Copilot información del proyecto. Asegurémonos de que los estándares de programación del repo estén documentados para mejorar las sugerencias de código.

1. Vuelve a abrir `.github/copilot-instructions.md`.
2. Busca la sección **Code formatting requirements**, que debería estar cerca de la línea 35. Observa cómo documenta los estándares de programación del proyecto, pero todavía no tiene ninguna regla sobre la documentación en el código; por eso la función auxiliar generada no tenía comentarios de documentación.
3. Añade las siguientes líneas de Markdown justo debajo de los estándares existentes para indicar a Copilot que añada encabezados de comentario a los archivos y comentarios de documentación TSDoc:

   ```markdown
   - Every exported function should have a TSDoc comment describing its purpose, parameters, and return value.
   - Before imports or any code, add a comment block to the file that explains its purpose.
   ```

4. Guarda `copilot-instructions.md`.

> [!TIP]
> Como has visto al principio de esta lección, los archivos de instrucciones se pueden crear a nivel de repo (`.github/copilot-instructions.md`) para directrices globales, o como archivos `*.instructions.md` para lenguajes, tipos de archivo o tareas concretos. El archivo del repo es el lugar adecuado para estándares de todo el proyecto, como la regla de comentarios de documentación que acabas de añadir.

## Volver a ejecutar el prompt y observar el cambio

1. Vuelve a Copilot Chat y selecciona **New Chat** para vaciar el búfer.
2. Haz clic de nuevo en `src/lib/publishers.ts` para que Copilot se centre en el archivo correcto.
3. Envía el **mismo prompt** que antes:

   ```plaintext
   Create or update src/lib/publishers.ts with a data-access helper that returns a list of all publishers with the name and id for each. Apply the file changes.
   ```

4. Observa que el archivo propuesto ahora empieza con un bloque de comentarios similar a este:

   ```typescript
   /**
    * Publisher data-access helpers for the Tailspin Toys Crowd Funding platform.
    * Provides functions to retrieve publisher information from the database.
    */
   ```

5. Observa que la función propuesta ahora incluye un comentario TSDoc similar a este:

   ```typescript
   /**
    * Returns a list of all publishers with their id and name.
    *
    * @param db - The Drizzle database client.
    * @returns A promise that resolves to an array of publisher objects.
    */
   ```

Acabas de orientar a Copilot para que siga un nuevo estándar del proyecto y lo aplique a código real sobre el que se construirá la siguiente lección.

## Hacer commit de las instrucciones y publicar la rama

Los archivos de instrucciones son como cualquier otro recurso del repo, es decir, se gestionan con el mismo control de código fuente que cualquier otro elemento. Así que hagamos commit y publiquemos la rama en nuestro repo.

1. Vuelve a la terminal que abriste al crear la rama.
2. Desde la terminal, confirma que la actualización de las instrucciones y los cambios de la función auxiliar están presentes ejecutando:

   ```bash
   git status
   ```

3. Desde la terminal, prepara y haz commit de la actualización de las instrucciones y de todos los archivos que Copilot haya cambiado para la base de la función auxiliar:

   ```bash
   git add .github/copilot-instructions.md src/lib/publishers.ts
   # Si git status muestra otros cambios relacionados (por ejemplo, pruebas), añade también esos archivos.
   git commit -m "Add doc comment standards and publishers helper foundation"
   ```

4. Desde la terminal, publica la rama en el repo:

   ```bash
   git push -u origin custom-instructions
   ```

## Crear y combinar una solicitud de incorporación de cambios

Con la rama publicada, deberíamos crear una solicitud de incorporación de cambios y vincularla a la issue del estándar de documentación de tu backlog. Podríamos hacerlo manualmente, pero Copilot puede hacerlo por nosotros con las herramientas de GitHub que ya están conectadas a tu proyecto. Pidamos a Copilot que busque la issue, cree la solicitud de incorporación de cambios que la cierra y, después, la combine.

> [!NOTE]
> Esta es la primera lección en la que Copilot actúa en GitHub por ti. La plantilla del workshop ya conecta las herramientas de GitHub a tu área de trabajo, así que no hay nada que configurar. La primera vez que Copilot use una, puede que VS Code te pida iniciar sesión en GitHub. Sigue las indicaciones para permitirlo. Aprenderás cómo funciona esta conexión (Model Context Protocol) en una lección posterior.

1. Abre Copilot Chat en VS Code.
2. Pulsa <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd> (en macOS, <kbd>Ctrl</kbd>+<kbd>Cmd</kbd>+<kbd>I</kbd>) para abrir la vista de Copilot Chat y asegúrate de que **Agent** está seleccionado en el selector de agentes.
3. Pide a Copilot que busque la issue relacionada con la actualización de los archivos de instrucciones y que cree, desde la rama actual, una solicitud de incorporación de cambios que describa tanto las actualizaciones de las instrucciones como la nueva base de la función auxiliar de editores:

   ```plaintext
   Find the issue related to updating the instructions file. Create a new PR from the current branch, highlight that the PR closes that issue, and include that we also added the publishers helper foundation for the upcoming filtering work.
   ```

4. Copilot empezará a buscar la issue y a crear la solicitud de incorporación de cambios.
5. Cuando te pida **Allow** para que Copilot realice acciones de GitHub en tu nombre, revisa el comando y selecciona **Allow** si procede.
6. Una vez creada la solicitud de incorporación de cambios, pide a Copilot que la combine y que vuelva a `main` con el siguiente prompt:

   ```plaintext
   Merge the PR into main. Then return to main locally, and pull the latest code so we are up to date.
   ```

7. Cuando te pida **Allow** para que Copilot realice acciones de GitHub y ejecute comandos de shell en tu nombre, revisa el comando y selecciona **Allow** si procede.

¡Has creado y combinado una solicitud de incorporación de cambios con la ayuda de GitHub Copilot!

## Resumen y pasos siguientes

Has explorado cómo obtiene Copilot contexto de los archivos de instrucciones de este proyecto y, después, has usado Copilot Chat en VS Code para:

- enviar un prompt de generación de código y observar lo que produce Copilot con las instrucciones *existentes*.
- añadir un nuevo estándar para todo el repo en `.github/copilot-instructions.md`.
- volver a ejecutar el mismo prompt y ver cómo el código propuesto adopta el nuevo estándar.
- hacer commit de la actualización de las instrucciones y de la base de la función auxiliar en `main` para que la siguiente lección pueda construir sobre ellas.

A continuación, pondrás en práctica esas instrucciones en [agent mode][next-lesson] mientras Copilot añade una nueva funcionalidad en todo el código.

## Recursos

- [Archivos de instrucciones para personalizar GitHub Copilot][instruction-files]
- [Procedimientos recomendados para crear instrucciones personalizadas][instructions-best-practices]
- [5 consejos para escribir mejores instrucciones personalizadas para Copilot][copilot-instructions-five-tips]
- [Instrucciones personalizadas personales para GitHub Copilot][personal-instructions]
- [Awesome Copilot: colección de archivos de instrucciones y otros recursos][awesome-copilot]

---

Esta lección es una traducción y adaptación de [Exercise 1 - Custom instructions (VS Code)][original-lesson], de [github-samples/copilot-workshops][original-repo]. Copyright (c) 2023 GitHub, con [licencia MIT][original-license].

[next-lesson]: ../2-agent-mode/
[instruction-files]: https://code.visualstudio.com/docs/copilot/copilot-customization
[instructions-best-practices]: https://docs.github.com/enterprise-cloud@latest/copilot/using-github-copilot/coding-agent/best-practices-for-using-copilot-to-work-on-tasks#adding-custom-instructions-to-your-repository
[personal-instructions]: https://docs.github.com/copilot/customizing-copilot/adding-personal-custom-instructions-for-github-copilot
[copilot-instructions-five-tips]: https://github.blog/ai-and-ml/github-copilot/5-tips-for-writing-better-custom-instructions-for-copilot/
[ui-instructions]: https://github.com/emepetres/tailspin-toys-devdays/blob/main/.github/instructions/ui.instructions.md
[astro-instructions]: https://github.com/emepetres/tailspin-toys-devdays/blob/main/.github/instructions/astro.instructions.md
[awesome-copilot]: https://github.com/github/awesome-copilot
[custom-instructions-support]: https://docs.github.com/copilot/reference/custom-instructions-support
[original-lesson]: https://github.com/github-samples/copilot-workshops/blob/main/docs/real-world-development/vscode/1-custom-instructions.md
[original-repo]: https://github.com/github-samples/copilot-workshops
[original-license]: https://github.com/github-samples/copilot-workshops/blob/main/LICENSE
