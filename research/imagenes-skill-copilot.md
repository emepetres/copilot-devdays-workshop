# Análisis de imágenes desde una skill de Copilot

> Ticket: #4 (mapa #1). Investigado el 2026-10-21 con fuentes primarias (docs de GitHub Copilot, docs y release notes de VS Code, changelog de GitHub, anuncio oficial en GitHub Community). No se ha hecho una prueba empírica en vivo; lo marcado como **[no verificado]** debe probarse antes del workshop.

## Resumen

- **Visión está en todos los planes, Free y Student incluidos**, y funciona en ask, plan y agent mode de VS Code ([changelog GA de visión, 2026-07-01][vision-ga]).
- En **Free y Student solo existe *Auto*** como selector de modelo: no se puede elegir a mano un modelo con visión ([Plans][plans], [anuncio Student #189268][student]). Ninguna doc dice que Auto escoja un modelo con visión cuando hay una imagen. Es el **principal riesgo**.
- Una imagen puede llegar al modelo de dos formas:
  1. **Adjuntándola en el chat** (pegar, arrastrar, clic derecho, *Add Context*, captura del navegador integrado). Es la vía documentada y la más fiable.
  2. **Que el agente la lea del workspace con su herramienta de lectura.** Desde VS Code 1.112, *"Agents can now read image files from disk and binary files natively"* ([release notes 1.112][v1112]). Así, una `SKILL.md` puede decirle al agente que lea `docs/arquitectura.png` **sin que nadie adjunte nada**.
- **Coste**: desde el 2026-06-01 la facturación va en **AI Credits** (1 crédito = 0,01 USD), según los tokens y el modelo. Ya no hay *premium requests* ([billing individual][billing]). Student tiene 200 créditos al mes ([student]). La doc no da la cifra de Free ni dice cuántos tokens cuesta una imagen.

## 1. Modelos con visión en Free / Student

| Hecho | Fuente |
|---|---|
| Free y Student tienen "an allowance of AI credits and access to models through auto model selection only". | [billing], [plans] |
| Desde el 24 de junio de 2026, Auto es "the default and only model selection experience" en Free y Student. Ofrece modelos de OpenAI, Anthropic y Google, "subject to plan restrictions". | [student] |
| Auto "selects the optimum model for your task, based on model availability and task complexity". | [model-comparison] |
| Para trabajar con visuales (diagramas, capturas), la doc recomienda **GPT-5.6 Luna** y **Claude Sonnet 4.6**: "These models support multimodal input". | [model-comparison] |
| VS Code marca qué modelos aceptan imágenes con la propiedad `vision` y el filtro `@capability:vision`. | [vscode-models] |
| Para ver qué modelo ha usado Auto, se pasa el ratón por encima de la respuesta del chat. | [vscode-models] |

**Conclusión**: en Free/Student, el alumno no controla si el modelo tiene visión. Es razonable esperar que Auto, con una imagen adjunta, use un modelo multimodal, porque casi todos los modelos actuales lo son, pero **no está documentado [no verificado]**. En la demo conviene enseñar a pasar el ratón sobre la respuesta para ver el modelo.

## 2. Cómo entra la imagen al modelo

### a) Adjuntar en el chat (documentado y fiable)
- En VS Code: "Paste, drag-and-drop, or right-click to attach images in the chat panel; works in ask, plan, and agent modes" ([vision-ga]).
- "You can attach an image as context to your chat prompt and ask questions about it". También se puede arrastrar una imagen desde el navegador ([vscode-context]).
- Desde el navegador integrado, *Add Screenshot to Chat* adjunta la captura del viewport ([vscode-context]).

### b) El agente lee el `.png` del workspace (posible desde 1.112)
- Release notes de 1.112: "Agents can now read image files from disk and binary files natively", por ejemplo "analyzing screenshots". El resto de binarios llegan "in a hexdump format" ([v1112]).
- La herramienta es `#read/readFile` ("Read a file") ([tools-ref]). La doc de la herramienta no menciona imágenes. Que devuelva la imagen como entrada visual, y no como hexdump, depende de que el modelo activo tenga visión **[no verificado en Free/Student]**.
- Las imágenes **no se indexan** para la búsqueda semántica, así que el agente no las "encuentra" por su contenido: la skill tiene que dar la ruta o un patrón ([workspace-context]).

### c) Mediante un script
- Una skill puede incluir scripts y recursos en su carpeta ([agent-skills]). Un script (OCR, conversión de PDF a PNG, etc.) puede **preprocesar** la imagen, pero no "pasa" la imagen al modelo: o el agente lee luego el resultado (texto), o lee la imagen generada con `readFile`. Para un público junior no aporta nada frente a b), salvo como plan B con OCR. Docling cubre esa necesidad en la lección siguiente.

## 3. Formato de `SKILL.md` (lo relevante)
- Carpetas del proyecto: `.github/skills/<nombre>/SKILL.md` (también `.claude/skills/` y `.agents/skills/`) ([agent-skills]).
- Frontmatter obligatorio: `name` (minúsculas, números y guiones, igual que el nombre de la carpeta, 64 caracteres como máximo) y `description` (qué hace y cuándo usarla, 1024 caracteres como máximo). Hay campos opcionales: `argument-hint`, `user-invocable`, `disable-model-invocation` y `context: fork` (experimental) ([agent-skills]).
- Carga progresiva: primero `name` y `description`, luego el cuerpo y luego los recursos *solo si el cuerpo los referencia* ("If a file isn't referenced in the instructions, it won't be loaded") ([agent-skills]).

### Ejemplo mínimo

```markdown
---
name: revisar-diagrama
description: Interpreta un diagrama de arquitectura (PNG/JPG) del repo y lo contrasta con el código para detectar inconsistencias. Úsala cuando el usuario pida revisar un diagrama, la arquitectura o si el código coincide con el diseño.
---

# Revisar diagrama frente al código

1. Localiza el diagrama. Si el usuario no da la ruta, busca ficheros `*.png`, `*.jpg` o `*.webp` en `docs/`.
2. Lee la imagen con la herramienta de lectura de ficheros (no te limites al nombre del fichero). Si no puedes ver su contenido, para y pide al usuario que adjunte la imagen al chat.
3. Describe en una lista los componentes, flechas o dependencias y tecnologías que aparecen en el diagrama.
4. Recorre el código (estructura de carpetas, imports, configuración) y comprueba cada elemento.
5. Responde con una tabla `Elemento | Diagrama | Código | ¿Coincide?` y una lista de inconsistencias, citando ficheros y líneas.
```

El paso 2 incluye un *fallback* explícito: si el modelo de Auto no "ve" la imagen, el agente pide que se adjunte a mano y la demo no inventa nada.

## 4. Limitaciones

- **Formatos**: JPEG, PNG, GIF y WebP, además de PDF en el chat ([vision-ga]). **SVG no aparece** en la lista. Si el diagrama es SVG o Mermaid, el agente lo lee como texto, lo cual también sirve para contrastarlo, pero no es "visión".
- **Tamaño y número**: la doc no da un límite en MB para el chat. En el SDK de Copilot el máximo depende del modelo, y las imágenes demasiado grandes se reducen o se descartan ([sdk-image]). Recomendación: PNG de menos de 1–2 MB, de unos 1500 px como máximo y con texto legible.
- **Coste**: se paga por tokens en AI Credits. Las llamadas a herramientas no suman peticiones aparte, pero sí tokens ([requests], [billing]). La doc no cuantifica el coste de una imagen. Con 200 créditos al mes en Student, unas pocas revisiones de diagrama no deberían ser un problema **[no verificado]**.
- **Versión de VS Code**: la lectura nativa de imágenes por el agente necesita **VS Code ≥ 1.112**. Hay que incluirlo en la lección 0.

## 5. Fiabilidad para una demo en directo

| Vía | Fiabilidad | Comentario |
|---|---|---|
| Adjuntar la imagen en agent mode y luego usar la skill | Alta | Documentada para Free/Student. |
| Una `SKILL.md` hace que el agente lea el `.png` del repo | Media | Documentada en 1.112, pero depende de que Auto elija un modelo con visión; probarlo con una cuenta Free/Student real. |
| Script u OCR | Baja o innecesaria | Mejor dejarlo para Docling o un plan B. |

**Recomendaciones**: probar el flujo b) con una cuenta Free y otra Student antes del día del workshop. Tener preparada una salida de ejemplo (plan B). Enseñar el adjunto manual como vía de respaldo dentro de la propia lección. Dibujar el diagrama sembrado con texto grande y pocas cajas.

## Fuentes

[vision-ga]: https://github.blog/changelog/2026-07-01-copilot-vision-is-generally-available/
[plans]: https://docs.github.com/en/copilot/get-started/plans
[student]: https://github.com/orgs/community/discussions/189268
[billing]: https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing
[requests]: https://docs.github.com/en/copilot/concepts/billing/copilot-requests
[model-comparison]: https://docs.github.com/en/copilot/reference/ai-models/model-comparison
[vscode-models]: https://code.visualstudio.com/docs/copilot/customization/language-models
[vscode-context]: https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context
[v1112]: https://code.visualstudio.com/updates/v1_112
[tools-ref]: https://code.visualstudio.com/docs/agents/reference/tools-reference
[workspace-context]: https://code.visualstudio.com/docs/agents/reference/workspace-context
[agent-skills]: https://code.visualstudio.com/docs/copilot/customization/agent-skills
[sdk-image]: https://docs.github.com/en/copilot/how-tos/copilot-sdk/use-copilot-sdk/image-input

- Copilot vision GA (changelog, 2026-07-01): <https://github.blog/changelog/2026-07-01-copilot-vision-is-generally-available/>
- Plans for GitHub Copilot: <https://docs.github.com/en/copilot/get-started/plans>
- Anuncio del plan Copilot Student (GitHub Community #189268, mantenedor de GitHub): <https://github.com/orgs/community/discussions/189268>
- Usage-based billing for individuals: <https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing>
- Requests in GitHub Copilot: <https://docs.github.com/en/copilot/concepts/billing/copilot-requests>
- AI model comparison: <https://docs.github.com/en/copilot/reference/ai-models/model-comparison>
- VS Code, Language models: <https://code.visualstudio.com/docs/copilot/customization/language-models>
- VS Code, Add context to chat: <https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context>
- VS Code 1.112 release notes: <https://code.visualstudio.com/updates/v1_112>
- VS Code, Tools and context reference: <https://code.visualstudio.com/docs/agents/reference/tools-reference>
- VS Code, Workspace context: <https://code.visualstudio.com/docs/agents/reference/workspace-context>
- VS Code, Agent skills: <https://code.visualstudio.com/docs/copilot/customization/agent-skills>
- Copilot SDK, Image input: <https://docs.github.com/en/copilot/how-tos/copilot-sdk/use-copilot-sdk/image-input>
