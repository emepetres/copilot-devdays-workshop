# Viabilidad de MAF + GitHub Copilot SDK para la lección extra

> Investigación para el ticket [#6](https://github.com/emepetres/copilot-devdays-workshop/issues/6) (mapa [#1](https://github.com/emepetres/copilot-devdays-workshop/issues/1)). Fuentes primarias consultadas el 2026-10-21.

## Veredicto

**Viable, con condiciones.** Técnicamente la integración es estable (GA) y el ejemplo mínimo cabe en unas 30 líneas de Python. Para un público junior, en 45 min, funciona **solo si**:

1. El entorno (Python ≥3.11, `uv`, paquetes, login de Copilot) se instala en la **lección 0**, no en directo.
2. El código se da **ya escrito** (plantilla) y la lección consiste en leerlo, ejecutarlo y cambiar prompts/participantes, no en escribir el framework desde cero.
3. Se usa **Python** y una orquestación **secuencial** de 2 agentes (p. ej. analista de imágenes → agente Docling → revisor). Magentic/group chat quedan como "para casa".
4. Se asume que **cada agente consume créditos de IA** del plan Free/Student (cuya cuantía no está publicada) y que el modelo lo elige `auto`.

Si no se cumplen esas condiciones, la **alternativa más simple** es usar **solo Copilot SDK** con *custom agents* (sub-agentes) en una sola sesión: misma idea de orquestación, un paquete menos y menos conceptos (ver §7).

## 1. Estado actual (GA / preview)

| Pieza | Estado | Versión (2026-10-21) | Fuente |
|---|---|---|---|
| GitHub Copilot SDK | **GA**, semver | `v1.0.24` (2026-10-20); PyPI `github-copilot-sdk` 1.0.24 | README de [github/copilot-sdk](https://github.com/github/copilot-sdk) ("The GitHub Copilot SDK is generally available and follows semantic versioning"); [release v1.0.24](https://github.com/github/copilot-sdk/releases/tag/v1.0.24) |
| MAF (Python) | Estable | `agent-framework` 1.22.0 ([python-1.22.0](https://github.com/microsoft/agent-framework/releases/tag/python-1.22.0), 2026-10-15) | PyPI / releases |
| Integración MAF ↔ Copilot (Python) | **Estable** desde `github-copilot-1.0.0` (2026-07-23): "Promote the package from release candidate to stable"; hoy `agent-framework-github-copilot` 2.1.0, clasificador `Development Status :: 5 - Production/Stable` | [python/CHANGELOG.md](https://github.com/microsoft/agent-framework/blob/main/python/CHANGELOG.md), [pyproject.toml](https://github.com/microsoft/agent-framework/blob/main/python/packages/github_copilot/pyproject.toml) |
| Integración MAF ↔ Copilot (.NET) | Publicada | NuGet `Microsoft.Agents.AI.GitHub.Copilot` 1.25.0 | [dotnet/src/Microsoft.Agents.AI.GitHub.Copilot](https://github.com/microsoft/agent-framework/tree/main/dotnet/src/Microsoft.Agents.AI.GitHub.Copilot), NuGet |

Ojo: el paquete Python ha tenido varios cambios **[BREAKING]** recientes (file hooks opt-in, consolidación de contenido, `SecretString`), así que conviene **fijar versiones** en el `requirements`/`pyproject` del workshop ([CHANGELOG](https://github.com/microsoft/agent-framework/blob/main/python/CHANGELOG.md)).

## 2. Lenguajes soportados

- **Copilot SDK**: Node.js/TypeScript, Python, Go, .NET, Java y Rust. En Node, Python y .NET **el Copilot CLI va incluido** como dependencia; en Go/Java/Rust hay que instalarlo aparte ([README copilot-sdk](https://github.com/github/copilot-sdk)).
- **MAF + Copilot**: **C#, Python y Go** (pivotes de la página de Microsoft Learn [GitHub Copilot | Agent Framework](https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/agent-services/github-copilot)). Python exige `>=3.11` ([pyproject](https://github.com/microsoft/agent-framework/blob/main/python/packages/github_copilot/pyproject.toml)).
- **Recomendación**: Python (Docling MCP también es Python, `docling-mcp` 3.3.0, `>=3.10`; se lanza con `uvx --from docling-mcp docling-mcp-server --transport stdio` según su [README](https://github.com/docling-project/docling-mcp)).

## 3. Autenticación y licencia (Copilot Free / Student)

- **Hace falta suscripción de Copilot** salvo BYOK; el README del SDK remite a la página de precios "which includes a free tier with limited usage" ([README copilot-sdk, FAQ](https://github.com/github/copilot-sdk)).
- **Métodos de auth**: usuario logueado en `copilot` CLI, token OAuth de GitHub App, variables `COPILOT_GITHUB_TOKEN` / `GH_TOKEN` / `GITHUB_TOKEN`, o BYOK ([docs/auth](https://github.com/github/copilot-sdk/blob/main/docs/auth/README.md)). Para alumnos lo más sencillo: login del CLI (o `gh auth login`, que el SDK también recoge como último recurso).
- **Copilot CLI está incluido en todos los planes**, Free y Student incluidos: "All plans include Copilot CLI and the Copilot app" ([Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans)).
- **Facturación**: el SDK factura igual que el CLI, "each prompt being counted towards your usage allowance" ([README copilot-sdk, FAQ](https://github.com/github/copilot-sdk)). Free y Student tienen "an allowance of AI credits", **sin cifra publicada**, y acceso a modelos "through auto model selection only" ([Usage-based billing for individuals](https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-individuals)).
- **Consecuencias para el diseño**:
  - No fijar `model="gpt-5"` ni `claude-sonnet-4` en el código del workshop; usar `model="auto"` (es lo que usan todos los ejemplos del [Getting Started del SDK](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md)) o no pasar modelo. *Inferencia*: un modelo fijo podría ser rechazado en Free/Student; no se ha probado.
  - Una orquestación de N agentes cuesta ≥N llamadas por ejecución (y más con herramientas). Con una cuota pequeña y sin cifra conocida, hay que limitar las ejecuciones en directo y tener **salidas pregrabadas** (plan B).
  - Las imágenes requieren un modelo con visión (`capabilities.supports.vision = true`) ([image-input.md](https://github.com/github/copilot-sdk/blob/main/docs/features/image-input.md)); con `auto` no está garantizado cuál toca. Riesgo a validar en un ensayo con una cuenta Free.
  - BYOK existe, pero añade claves de un proveedor de pago: no encaja con el público.
- **No hay nada exclusivo de Business/Enterprise** en la ruta propuesta (CLI + SDK + MCP local).

## 4. Ejemplo mínimo: agente Copilot dentro de MAF con Docling MCP

Basado en el ejemplo oficial [`github_copilot_with_mcp.py`](https://github.com/microsoft/agent-framework/blob/main/python/samples/02-agents/providers/github_copilot/github_copilot_with_mcp.py), cambiando el servidor MCP por Docling:

```python
import asyncio
from agent_framework.github import GitHubCopilotAgent, GitHubCopilotOptions
from copilot.session import MCPServerConfig, PermissionHandler

mcp_servers: dict[str, MCPServerConfig] = {
    "docling": {
        "type": "stdio",
        "command": "uvx",
        "args": ["--from", "docling-mcp", "docling-mcp-server", "--transport", "stdio"],
        "tools": ["*"],
    },
}

async def main() -> None:
    agent = GitHubCopilotAgent(
        instructions="Eres un revisor que lee documentos con Docling y resume requisitos.",
        default_options=GitHubCopilotOptions(
            on_permission_request=PermissionHandler.approve_all,  # solo en demo
            mcp_servers=mcp_servers,
            timeout=180,
        ),
    )
    async with agent:
        print(await agent.run("Convierte docs/requisitos.pdf y lista los requisitos."))

asyncio.run(main())
```

Instalación: `pip install agent-framework-github-copilot` (arrastra `agent-framework-core` y `github-copilot-sdk`, que trae el CLI) ([README del paquete](https://github.com/microsoft/agent-framework/blob/main/python/packages/github_copilot/README.md)).

Notas de la fuente:
- Por defecto el agente **no** puede ejecutar shell, leer/escribir ficheros ni hacer fetch; hay que dar un `on_permission_request` ([MS Learn](https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/agent-services/github-copilot)).
- Los servidores MCP se pasan por `mcp_servers` en las opciones, **no** en `tools` (se rechazan desde [#7835](https://github.com/microsoft/agent-framework/pull/7835)).
- MS Learn recomienda contenedor (Dev Container) para agentes con permisos de shell/ficheros.
- El agente también acepta adjuntos de imagen como blobs inline desde `github-copilot-1.0.0` ([CHANGELOG, #7300](https://github.com/microsoft/agent-framework/pull/7300)), lo que permite el agente de análisis de imágenes sin MCP.

## 5. Orquestación multi-agente

Dos caminos, ambos documentados:

**a) Orquestación de MAF (código).** `GitHubCopilotAgent` hereda de `BaseAgent` ([`_agent.py`](https://github.com/microsoft/agent-framework/blob/main/python/packages/github_copilot/agent_framework_github_copilot/_agent.py)) y los builders de `agent_framework.orchestrations` aceptan cualquier `SupportsAgentRun` ([`_sequential.py`](https://github.com/microsoft/agent-framework/blob/main/python/packages/orchestrations/agent_framework_orchestrations/_sequential.py)). Patrones disponibles: secuencial, concurrente, handoff, group chat y Magentic ([samples/03-workflows/orchestrations](https://github.com/microsoft/agent-framework/tree/main/python/samples/03-workflows/orchestrations)). Para el workshop:

```python
from agent_framework.orchestrations import SequentialBuilder

workflow = SequentialBuilder(participants=[analista_imagenes, lector_docling, revisor]).build()
```

*Inferencia*: los ejemplos oficiales de orquestación usan `FoundryChatClient` (Azure), no Copilot; **no hay un sample oficial que combine `GitHubCopilotAgent` con `SequentialBuilder`**. Por la interfaz debería funcionar (y el changelog trata casos de "agents invoked as tools", [#8853](https://github.com/microsoft/agent-framework/pull/8853)), pero hay que probarlo antes del evento. Cada agente arranca su propia sesión de Copilot CLI: más lento y más consumo de cuota.

**b) Sub-agentes del propio Copilot SDK (sin MAF).** `customAgents` en la sesión: cada agente con su prompt, herramientas y **MCP propios**; el runtime delega automáticamente ("Inference") y existe *Fleet Mode* para paralelo ([custom-agents.md](https://github.com/github/copilot-sdk/blob/main/docs/features/custom-agents.md)). Menos control explícito del flujo, pero muchas menos piezas.

## 6. Tiempo realista de montaje (45 min)

Estimación propia (no hay fuente que la dé), suponiendo lección 0 hecha:

| Bloque | Tiempo |
|---|---|
| Conceptos: qué es un agente, MAF vs Copilot SDK, permisos | 8 min |
| Ejecutar el agente Copilot mínimo (plantilla) | 7 min |
| Añadir Docling MCP y probar con el PDF del repo | 10 min |
| Agente de imágenes (adjunto) + `SequentialBuilder` de 2–3 agentes | 15 min |
| Margen para errores / cuota | 5 min |

Riesgos de tiempo: primera descarga de modelos de Docling (pesada; hacerla en la lección 0), arranque del CLI por agente, latencia de MCP (el sample sube el `timeout` a 120 s), límites de cuota Free, Windows + `uvx`/`npx` en PATH. Sin lección 0 hecha, no cabe en 45 min.

## 7. Alternativa más simple

Por orden de simplicidad:

1. **Agentes custom de VS Code** (ficheros `.agent.md`/skills + MCP en `mcp.json`), sin código: es lo que ya hacen las lecciones de imagen y Docling. Encaja si la lección extra se descarta.
2. **Solo Copilot SDK (Python)** con `customAgents`: un único paquete (`pip install github-copilot-sdk`, CLI incluido), mismo login, MCP por agente y sub-agentes orquestados por el runtime. Es la **alternativa recomendada** si MAF resulta pesado: enseña "orquestación por código" con menos conceptos.
3. **MAF + Copilot SDK** (este documento): añade orquestaciones explícitas (secuencial/concurrente/handoff/Magentic), observabilidad OpenTelemetry y la posibilidad de mezclar proveedores. Valor real para quien siga después, pero más conceptos.

## 8. Pendiente de validar en un ensayo

- Ejecutar el ejemplo de §4 y la secuencia de §5 con una cuenta **Copilot Free** real (créditos consumidos por ejecución, si `auto` elige un modelo con visión).
- Confirmar que `GitHubCopilotAgent` funciona dentro de `SequentialBuilder` sin ajustes.
- Medir el tiempo de la primera ejecución de Docling MCP en Windows.

## Fuentes

- github/copilot-sdk: [README](https://github.com/github/copilot-sdk), [getting-started](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md), [auth](https://github.com/github/copilot-sdk/blob/main/docs/auth/README.md), [custom-agents](https://github.com/github/copilot-sdk/blob/main/docs/features/custom-agents.md), [image-input](https://github.com/github/copilot-sdk/blob/main/docs/features/image-input.md), [usage-and-billing](https://github.com/github/copilot-sdk/blob/main/docs/features/usage-and-billing.md)
- microsoft/agent-framework: [paquete github_copilot](https://github.com/microsoft/agent-framework/tree/main/python/packages/github_copilot), [samples Copilot](https://github.com/microsoft/agent-framework/tree/main/python/samples/02-agents/providers/github_copilot), [orquestaciones](https://github.com/microsoft/agent-framework/tree/main/python/samples/03-workflows/orchestrations), [CHANGELOG Python](https://github.com/microsoft/agent-framework/blob/main/python/CHANGELOG.md)
- Microsoft Learn: [GitHub Copilot | Agent Framework](https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/agent-services/github-copilot)
- GitHub Docs: [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans), [Usage-based billing for individuals](https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-individuals)
- Docling MCP: [docling-project/docling-mcp](https://github.com/docling-project/docling-mcp)
