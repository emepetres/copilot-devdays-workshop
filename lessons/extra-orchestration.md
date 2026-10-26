---
title: "Extra: orchestration in code"
---

Do this after *[The Engineering Reviewer with Docling MCP](../engineering-reviewer/)* (at home).

**Goal:** rebuild the **Engineering Reviewer** in code, outside VS Code, as a sequence of three agents in Python: a **diagram** agent, a **documents** agent that uses Docling, and a **synthesizer** that writes the report. You use the [Microsoft Agent Framework][maf] to chain them and the [GitHub Copilot SDK][copilot-sdk] to run each one, and you reuse your two skills as their instructions: the same `SKILL.md` works in VS Code and in code.

Plan for **about 45 minutes**, all at home. This lesson is optional and not part of the session.

> [!IMPORTANT]
> **Where you should be**
>
> - Branch `sorting`, with the `review-diagram` and `review-documents` skills, the `engineering-reviewer` agent and its report committed, from *[The Engineering Reviewer with Docling MCP](../engineering-reviewer/)*.
> - Docling installed and `check` all green, from the *[Extra prerequisites](../prerequisites/)*. `setup` also installed `uv`, which this lesson uses to run Python.
> - The **Auto** model, optimized for **Efficiency**, selected in the chat.

> [!WARNING]
> **Each run of the reviewer uses your Copilot credits.** It starts three agents, and each one reads files and calls tools, like a long chat in agent mode. Run the example agent once and the full review once or twice at most. The solution has a recorded output, so you can compare without running it again.

> [!TIP]
> You can write to the agent in Spanish. The code and its prompts are in English, but the agent answers in the language you use.

## 1. Bring in the lesson material

From the root of your repo, in the VS Code terminal, run:

```shell
npx -y github:emepetres/copilot-devdays-workshop#mod-v1 lesson extra
```

It copies a small Python project to `reviewer/`, at the root of your repo. If you already ran `setup` in the *[Extra prerequisites](../prerequisites/)*, the files are there and the command just says they are up to date.

| File | What it is |
|---|---|
| `reviewer/pyproject.toml` | The project: Python 3.11 or later and two packages, at exact versions |
| `reviewer/uv.lock` | The exact versions of every package they bring along, so everyone installs the same |
| `reviewer/review.py` | The reviewer: the **diagram** agent already written, as an example, and three `TODO`s for you |

## 2. Install it

In the terminal, run:

```shell
cd reviewer
uv sync
```

`uv` creates a virtual environment in `reviewer/.venv` and installs the packages there. If you don't have Python 3.11 or later, it downloads it too, only for this project. Nothing is installed globally.

The two packages are:

- **`agent-framework-github-copilot`**: `GitHubCopilotAgent`, an agent of the Agent Framework that runs a GitHub Copilot session. It brings the Copilot SDK, and the SDK brings the Copilot CLI: the same agent you use in VS Code, without the editor.
- **`agent-framework-orchestrations`**: the builders that put several agents to work together, such as `SequentialBuilder`.

The agents sign in with your GitHub account, the one you signed in with `gh auth login` in the *Extra prerequisites*, and use your Copilot plan.

## 3. Run the example agent

Open `reviewer/review.py` and read it from the top. It is short, and every piece has a counterpart in what you built in VS Code:

| In `review.py` | In VS Code |
|---|---|
| `skill("review-diagram")` reads `.github/skills/review-diagram/SKILL.md`, without its frontmatter, and uses it as the agent's instructions | The skill that the agent loads when the task needs it |
| `available_tools` in `options()`: `view`, `rg` and `glob`, which only read | `tools:` in `engineering-reviewer.agent.md` |
| `DOCLING` and `DOCLING_TOOLS`: the Docling MCP server and the four tools that `review-documents` uses | The `docling` entry in `.vscode/mcp.json` and the four Docling tools of the agent |
| `"model": "auto"` | **Auto** in the model picker |
| `working_directory`: the root of your repo | The workspace open in VS Code |
| `on_permission_request`: allows every tool call | Selecting **Allow** in the chat. It is safe here because the agent only has tools that read |
| `IN_A_PIPELINE`: a few lines added to the skill, so the agent returns its findings instead of writing its own report | — |

`main()` runs the example agent on its own. Run it from `reviewer/`:

```shell
uv run review.py
```

It prints `-> diagram is working...` and, about two minutes later, the review of the diagram: the same table as `/review-diagram`, with the three inconsistencies of the diagram. It doesn't write any file.

> [!NOTE]
> **How does the agent see the diagram?** The way it did in VS Code: the skill tells it to open `docs/architecture.png` with its file-reading tool, `view`, and the model behind *Auto* has vision. You could also attach the image to the message, but in a sequence every agent receives the whole conversation, so the image would reach all three agents, and each one would pay for it.

> [!NOTE]
> **Agent Framework or Copilot SDK?** Both, and each does one job. The **Copilot SDK** runs one Copilot agent from code: its model, its tools, its MCP servers. The **Agent Framework** is Microsoft's framework to build agents and put them to work together, with any model provider. `GitHubCopilotAgent` joins them: a Copilot agent that the framework can chain with others.

## 4. Sharpen the idea with `/grill-with-docs`

You complete the reviewer with the agent, as you did with the skills: first you agree on what to build.

1. Open a **New Chat** and select **Agent**, the **Auto** model and the **Interactive** mode.
2. Send:

   ```text
   /grill-with-docs complete the TODOs of reviewer/review.py: a documents agent like the diagram agent, a synthesizer, and a SequentialBuilder that chains the three and saves the report. Read the code of the Agent Framework and the Copilot SDK in reviewer/.venv if you need their API. Use the /grilling and /domain-modeling skills. Keep it to 1 round of questions. Don't write any code yet.
   ```

3. Answer the round. Steer towards these decisions if the agent doesn't propose them:
   - **The documents agent** is built like the diagram agent, with the `review-documents` skill, the read tools and the four Docling tools, and the `docling` server in `mcp_servers`.
   - **The synthesizer** plays the role of `engineering-reviewer.agent.md`: it reads the findings of the other two in the conversation, checks the `## Architecture` section of `README.md` and answers **with the report only**, in the same table *Source A · Source B · Discrepancy · Evidence*. It only has the read tools.
   - **Only the program writes**: it saves the last message of the synthesizer to `docs/reviews/engineering-review.md`. No agent can write files.
   - **The sequence** is diagram → documents → synthesizer, with `SequentialBuilder`, and it prints which agent is working, so you know it hasn't hung.
   - **No new packages**: the two in `pyproject.toml` are enough.
4. Keep it short: **5 minutes at most**.

> [!TIP]
> **Prefer Plan mode?** Select **Plan** instead of **Agent**, send the same request without `/grill-with-docs` and the sentence about skills, and refine the plan it proposes. *[Matt Pocock's workflow](../pocock-workflow/)* compares both ways.

## 5. Complete the reviewer with agent mode

1. In the **same chat**, still in **Agent**, send:

   ```text
   Implement what we agreed in reviewer/review.py. Don't run it: I will.
   ```

   It shouldn't run it because each run uses your credits. If it asks to run a command anyway, select **Skip**.

2. Open `reviewer/review.py` and check it:
   - `documents_agent()` loads `review-documents`, adds `DOCLING_TOOLS` to `READ_TOOLS` and passes `mcp_servers={"docling": DOCLING}`.
   - `synthesizer_agent()` has instructions of its own and only `READ_TOOLS`.
   - `main()` builds `SequentialBuilder(participants=[...])` with the three agents in that order, runs it and writes the synthesizer's answer to `REPORT`.
3. If the editor underlines a name in red, ask the agent to fix it in the same chat, without running it.

## 6. Run the review

From `reviewer/`, run:

```shell
uv run review.py
```

It takes **about 5 minutes**. You see each agent start:

```text
-> diagram is working...
-> documents is working...
-> synthesizer is working...

Report written to docs/reviews/engineering-review.md
```

Each agent is a Copilot session of its own, outside VS Code, so nothing shows up in the chat. The documents agent takes longest, because it converts the PDFs with Docling, OCR of the scanned minutes included.

The program writes the report where the `engineering-reviewer` agent wrote it, so it replaces the report of the last lesson. Open the **Source Control** panel and select `docs/reviews/engineering-review.md` to compare both reviews side by side.

How many inconsistencies did it find? Are they the same six as in VS Code? Check them yourself before you look at the solution.

> [!WARNING]
> **If it fails:**
>
> - **An authentication error**: run `gh auth login` again and select **GitHub.com**. Check that the account has Copilot.
> - **The documents agent can't use Docling**: the program starts `docling-mcp-server` by its name, as VS Code does. If you had to write its absolute path in `.vscode/mcp.json` in the last lesson, do the same here: run `check` from the root of your repo and replace `"docling-mcp-server"` in the `command` of `DOCLING` with the path it prints. On Windows, write it with forward slashes, such as `"C:/Users/you/.local/bin/docling-mcp-server.exe"`.
> - **`Timeout`**: the conversion of the minutes took longer than 15 minutes, which only happens on a very slow machine. Raise `timeout` in `options()`.

## 7. Commit

1. Open the **Source Control** panel.
2. Stage `reviewer/pyproject.toml`, `reviewer/uv.lock`, `reviewer/review.py` and `docs/reviews/engineering-review.md`. `reviewer/.venv/` doesn't show up: `uv` keeps it out of git.
3. Generate a commit message with the **Sparkle** button and select **Commit**.

You end on `sorting`, with the Engineering Reviewer in VS Code and in code.

<details>
<summary>Solution</summary>

Your code will differ in the wording of the prompts and in small details. This is a version that works, tested with *Auto*. Only the TODOs change; the rest of `review.py` stays as it came.

**The documents agent**, in place of `TODO 1`:

```python
def documents_agent() -> GitHubCopilotAgent:
    return GitHubCopilotAgent(
        skill("review-documents") + IN_A_PIPELINE,
        name="documents",
        default_options=options(READ_TOOLS + DOCLING_TOOLS, mcp_servers={"docling": DOCLING}),
    )
```

**The synthesizer**, in place of `TODO 2`:

```python
SYNTHESIZER_INSTRUCTIONS = """You are the Engineering Reviewer of Tailspin Toys. You find where the requirements, the architecture and the implementation disagree. You report; you never fix.

The conversation holds the findings of two reviewers: one checked the architecture diagram against the code, the other the PDF documents in docs/.

1. Read the `## Architecture` section of README.md and check it against the code too. The code is the source of truth.
2. Merge everything into one report, in Markdown:
   - A table with the columns `Source A | Source B | Discrepancy | Evidence`, one row per inconsistency. In `Evidence`, cite the anchor or the section of the document, and the file and line of the code.
   - A section `## Checked and consistent`, with what was checked and matches.

Answer with the report only, starting with its table: the program saves your answer as the report."""


def synthesizer_agent() -> GitHubCopilotAgent:
    return GitHubCopilotAgent(
        SYNTHESIZER_INSTRUCTIONS,
        name="synthesizer",
        default_options=options(READ_TOOLS),
    )
```

**The sequence**, in `main()`, in place of `TODO 3`. Add `from agent_framework import AgentResponse` to the imports and remove the `# noqa` comment from the import of `SequentialBuilder`:

```python
async def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")  # so a Windows terminal can print any answer

    diagram, documents, synthesizer = diagram_agent(), documents_agent(), synthesizer_agent()
    workflow = SequentialBuilder(participants=[diagram, documents, synthesizer]).build()
    # Each agent runs as a step of the workflow, named after the agent.
    agent_names = {diagram.name, documents.name, synthesizer.name}

    async with diagram, documents, synthesizer:
        stream = workflow.run(TASK, stream=True)
        async for event in stream:
            if event.type == "executor_invoked" and event.executor_id in agent_names:
                print(f"-> {event.executor_id} is working...")
        result = await stream.get_final_response()

    # The synthesizer streams every message it writes; the report is the last one.
    report = AgentResponse.from_updates(result.get_outputs()).messages[-1].text
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(report, encoding="utf-8")
    print(f"\nReport written to {REPORT.relative_to(REPO).as_posix()}")
```

Two details that are easy to miss:

- `async with` starts the three agents, each with its Copilot CLI, and stops them at the end, even if something fails.
- With `stream=True`, the output of the `workflow` arrives in pieces, one per chunk of text. Before using a tool, the synthesizer often writes a sentence such as *"I'll check the README…"*, and that sentence arrives as a separate message. `AgentResponse.from_updates(...)` joins the pieces into messages, and the report is the last one.

**The recorded run** took 4 min 27 s on Windows with *Auto*. The report found **the six inconsistencies** and one false positive:

| Source A | Source B | Discrepancy | Evidence |
|---|---|---|---|
| `docs/architecture.png`: "REST API (Flask)" | `README.md` §Architecture | The diagram shows a separate Flask API, but the README and code describe a single Astro site with no separate backend. | README lines 3, 7–8; homepage calls `getAllGames()` in frontmatter (`src/pages/index.astro:7–11`); no API routes exist. |
| `docs/architecture.png`: browser fetches `/api/games` at runtime | `README.md` §Architecture | The diagram shows a runtime API fetch; the homepage gets data during prerendering instead. | README lines 3, 7; `src/pages/index.astro:7–11`; static output is configured in `astro.config.mjs:7`. |
| `docs/architecture.png`: API sends SQL queries to the database | `README.md` §Architecture | There is no API component. Astro calls a data helper that queries through Drizzle. | README lines 3, 8; `src/pages/index.astro:7–11`; `src/lib/games.ts:47–55`. |
| `docs/architecture.png`: PostgreSQL | `README.md` §Architecture | The diagram names PostgreSQL, but the project uses SQLite. | README lines 3, 8; `drizzle.config.ts:3, 6–7`; `src/lib/db.ts:1, 85`. |
| `docs/architecture.png`: `Backers` table | `README.md` §Architecture | The diagram includes a table absent from the schema, which defines only publishers, categories, and games. | `db/schema.ts:3–25`. |
| `docs/architecture.png`: `games.csv` seed arrow points to PostgreSQL | `README.md` §Architecture | The seed script reads the CSV and inserts into the SQLite-backed tables, not PostgreSQL. | README lines 8, 47; `db/seed.ts:54–69`; `drizzle.config.ts:6–7`. |
| `docs/requirements.pdf` `#/texts/20`: catalog updates in real time, within five seconds, without redeploying | `README.md` §Architecture | The site is static and gets database data during the build; database changes do not update the deployed catalog without rebuilding and redeploying. | README lines 3, 7, 13; `astro.config.mjs:7`; `src/pages/index.astro:9–11`. |
| `docs/requirements.pdf` `#/texts/12`: a game can belong to several categories | — | Each game has one required `categoryId`; the data model and game page expose and render a single category. | `db/schema.ts:20–22`; `src/types/game.ts:23–26`; `src/pages/game/[id].astro:39–42`. |
| `docs/meeting-minutes.pdf` `#/texts/14`: ratings are whole numbers from 1 to 10, without stars | — | Ratings are clamped to 0–5, rendered with star glyphs, and shown to one decimal place. | `src/lib/ratings.ts:12–13, 23–31`; `src/components/StarRating.astro:14–15`. |
| `docs/architecture.png`: "Browser (backer)" | `docs/meeting-minutes.pdf` `#/texts/15` | Backer support is only partially implemented: the game page displays a support button, but the code does not process contributions. | `src/pages/game/[id].astro:59–61`. |

The first six rows are inconsistencies 1–3 of the diagram, split by element. The next three are 4–6, from the documents. The last row is the **false positive**: decision D3 of the minutes says the *Support This Game* button doesn't process contributions, and the code agrees. The table of six inconsistencies is in the solution of *[The Engineering Reviewer with Docling MCP](../engineering-reviewer/)*.

Your run will differ: *Auto* may pick another model, and the agents may group the findings another way. What matters is that the six are there and that each one points at code you can open.

</details>

## At home: run two agents at once

The diagram agent and the documents agent don't need each other: only the synthesizer needs both. Running them **at the same time** saves the time of the shorter one.

The Agent Framework has a builder for that, `ConcurrentBuilder`: it sends the same task to all its participants at once and joins their answers. Change `main()` so that:

1. `ConcurrentBuilder(participants=[diagram, documents])` runs the first two agents at once.
2. `.with_aggregator(...)` receives their answers, a list of `AgentExecutorResponse`. Each answer's text is in `response.agent_response.text`. The aggregator joins those texts and passes them to `synthesizer.run(...)`, whose text becomes the report.

Ask the agent to make the change, with `/grill-with-docs` or Plan mode as before, and compare the time with the sequence. You pay the same credits: the same three agents do the same work.

When that works, look at the other orchestrations of the framework: [handoff][maf-handoff], where an agent hands the conversation to another; [group chat][maf-group-chat], where a manager chooses who speaks next; and [Magentic][maf-magentic], where a manager plans the task and assigns each step.

## Summary

You rebuilt the Engineering Reviewer in code. You:

- ran a Copilot agent from Python, with the Copilot SDK inside the Agent Framework;
- reused your two skills as the instructions of two agents, so the same `SKILL.md` serves VS Code and code;
- restricted each agent's tools in code, as `tools:` does in a custom agent;
- chained three agents with `SequentialBuilder`, so each one reads what the previous ones found;
- compared the review in code with the review in VS Code.

## Resources

- [Microsoft Agent Framework][maf]
- [GitHub Copilot in the Agent Framework][maf-copilot]
- [Sequential orchestration][maf-sequential] and [concurrent orchestration][maf-concurrent]
- [GitHub Copilot SDK][copilot-sdk]
- [Samples of `GitHubCopilotAgent`][maf-copilot-samples]

[maf]: https://learn.microsoft.com/en-us/agent-framework/
[maf-copilot]: https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/agent-services/github-copilot
[maf-sequential]: https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/sequential
[maf-concurrent]: https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/concurrent
[maf-handoff]: https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/handoff
[maf-group-chat]: https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/group-chat
[maf-magentic]: https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/magentic
[maf-copilot-samples]: https://github.com/microsoft/agent-framework/tree/main/python/samples/02-agents/providers/github_copilot
[copilot-sdk]: https://github.com/github/copilot-sdk
