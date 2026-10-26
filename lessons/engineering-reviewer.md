---
title: "The Engineering Reviewer with Docling MCP"
---

Do this after *[A skill that reads images](../image-skill/)*.

**Goal:** finish the **Engineering Reviewer**. You connect Docling through MCP, write a second skill, `review-documents`, that reads PDFs without loading them whole, and create the `engineering-reviewer` custom agent, which uses `review-documents` and `review-diagram` to check the documents, the diagram, the `README.md` and the code against each other. It leaves one report with every inconsistency it finds.

Plan for **about 28 minutes**, plus **about 7 at home** for the token demo.

> [!IMPORTANT]
> **Where you should be**
>
> - Branch `sorting`, with the `review-diagram` skill and its report committed, from *[A skill that reads images](../image-skill/)*.
> - Docling installed and `check` all green, from the *[Extra prerequisites](../prerequisites/)*.
> - The **Auto** model, optimized for **Efficiency**, selected in the chat.

> [!TIP]
> You can write to the agent in Spanish. The skill and the agent you write are in English, but the agent answers in the language you use.

## 1. Bring in the lesson material

From the root of your repo, in the VS Code terminal, run:

```shell
npx -y github:emepetres/copilot-devdays-workshop#mod-v1 lesson docling
```

It copies two documents of the Tailspin Toys product team to `docs/`. If you already ran `setup` in the *[Extra prerequisites](../prerequisites/)*, they are there and the command just says they are up to date.

| File | What it is |
|---|---|
| `docs/requirements.pdf` | The requirements specification of the catalog: two pages of functional and non-functional requirements |
| `docs/meeting-minutes.pdf` | The minutes of a product committee meeting, **scanned**: a picture of a page, with no text inside. Only OCR can read it |
| `docs/reviews/_docling/*.md` | The same two documents already converted to Markdown, in case Docling fails on the day |

Open both PDFs in VS Code if you are curious, but don't hunt for the inconsistencies yourself: that's the reviewer's job.

## 2. Connect Docling through MCP

Copilot can't read a PDF on its own, let alone a scanned one. [Docling][docling] can: it converts documents, including scans with OCR, into a structure that the agent can explore piece by piece. You installed its MCP server in the *Extra prerequisites*; now you tell VS Code about it.

> [!NOTE]
> **What is an MCP server?** A program that gives the agent new tools, following the [Model Context Protocol][mcp]. VS Code starts the servers listed in `.vscode/mcp.json` and offers their tools to the agent, which decides when to call them. Your repo already has that file, with the servers of the base workshop. If you did *[Exercise 3][ex3]*, you used one of them, Playwright.

1. Open `.vscode/mcp.json`.
2. **Add** this `docling` entry inside `"servers"`, after the last server that is already there. Put a comma after the closing `}` of that server, and don't change the rest of the file:

   ```json
   "docling": {
     "type": "stdio",
     "command": "docling-mcp-server",
     "args": ["--transport", "stdio", "conversion", "manipulation"],
     "env": {
       "DOCLING_MCP_CONVERSION_MODE": "local"
     }
   }
   ```

   It is the same configuration that `setup` used for the warm-up: it converts on your machine (`local`) and loads only the tool groups that read documents (`conversion` and `manipulation`). Don't use the configuration in the Docling README: it expects a remote conversion service.

3. Save the file. Select **Start** in the small link that VS Code shows above `"docling"`, or open the Command Palette (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>), run **MCP: List Servers**, select **docling** and **Start Server**.
4. Check that it starts: the link above `"docling"` says **Running** and the number of tools, **10**.

> [!WARNING]
> **If VS Code can't find `docling-mcp-server`** (the server doesn't start, and **Show Output** says *spawn docling-mcp-server ENOENT* or *not recognized*), VS Code didn't pick up the new `PATH`. Run `check` again and replace `"docling-mcp-server"` in `command` with the absolute path it prints. On Windows, write it with forward slashes, such as `"C:/Users/you/.local/bin/docling-mcp-server.exe"`.

## 3. Sharpen the idea with `/grill-with-docs`

The reviewer has two pieces, and you sharpen both in one conversation.

1. Open a **New Chat** and select **Agent**, the **Auto** model and the **Interactive** mode, so that the agent asks you instead of answering itself.
2. Send:

   ```text
   /grill-with-docs a custom agent, engineering-reviewer, that checks the documents in docs/ (requirements.pdf and the scanned meeting-minutes.pdf), the architecture diagram and the README against the code, and writes one report of the inconsistencies. It reads the PDFs with a new skill, review-documents, that uses the docling MCP server, and the diagram with the review-diagram skill. Use the /grilling and /domain-modeling skills. Keep it to 1 or 2 rounds of questions. Don't write anything yet.
   ```

3. Answer each round. Steer towards these decisions if the agent doesn't propose them:
   - **`review-documents` reads by anchors, never the whole document.** Convert the PDF, get the outline of its anchors (`#/texts/12`…), search for words and read only the items it needs. It never exports a whole document to Markdown without a size limit. If the Docling tools are missing, it falls back to `docs/reviews/_docling/`.
   - **The agent is thin.** It sets the role and the sources, restricts its `tools:` and leaves the *how* to the two skills.
   - **The code is the source of truth.** The documents, the diagram and the README are all checked against it.
   - **It reports, it doesn't fix.**
   - **One report**: `docs/reviews/engineering-review.md`, with a table *Source A · Source B · Discrepancy · Evidence*, where the evidence is the anchor of the document and the file and line of the code.
   - **The issues of the repo are out**: reading them needs `gh` and the terminal. You can add that at home.
4. Keep it short: **7 minutes at most**.

## 4. Write the skill and the agent with `/writing-for-agents`

1. In the **same chat**, send:

   ```text
   /writing-for-agents write what we agreed, in English: the skill .github/skills/review-documents/SKILL.md and the custom agent .github/agents/engineering-reviewer.agent.md. The agent's tools are read, search, edit and only the four docling tools it needs: docling/convert_document_into_docling_document, docling/get_overview_of_document_anchors, docling/search_for_text_in_document_anchors and docling/get_text_of_document_item_at_anchor. The report in docs/reviews/engineering-review.md is a deliverable the user asks for: say so explicitly in the agent, because the custom instructions of this repo say "Do not generate summary markdown files".
   ```

2. Check the skill, `.github/skills/review-documents/SKILL.md`:
   - `name` is `review-documents`, the same as its folder, and the `description` says what it does and when to use it.
   - The steps go **convert → outline → search → anchors**, and it forbids exporting the whole document.
3. Check the agent, `.github/agents/engineering-reviewer.agent.md`:
   - `tools:` lists `read`, `search`, `edit` and the four Docling tools, and nothing else. Without `edit` it can't write the report.
   - The body names both skills, the sources, the report and the sentence about the deliverable.

> [!NOTE]
> **Skill or custom agent?** Here you need both, because in Copilot they do different jobs.
>
> - A **skill** is *how to do* a task. The agent loads it only when the task needs it, and it works in any tool that reads skills, such as Copilot, Claude Code or Codex.
> - A **custom agent** is *a role*, with its own instructions, its own set of tools and, if you want, its own model. You pick it in the chat, and it can only use the tools in its `tools:` list.
> - In Copilot, a skill can't do what the agent does: it can't remove tools or restrict what the agent can run. Here the agent sees only four Docling tools and has no terminal at all. Even if you turn on the Docling tool that dumps whole documents, as you will at home, the agent can't call it.
> - Picked from the dropdown, the custom agent works in your conversation, with the same context. It only gets a context of its own when another agent calls it as a **subagent**.

<details>
<summary>Go deeper: when do you need an agent?</summary>

Start with a skill. A skill holds the *how*: steps, checklists, scripts, templates. A general agent with good skills covers most workflows, and in some tools a skill can even run in a context of its own. The author of this workshop builds all kinds of workflows in Claude Code with skills alone, and has never needed a custom agent there.

Create an agent when you need something about *who does the work* that a skill can't guarantee:

- **A tool boundary that is enforced and lasts**, as in least privilege: a reviewer that must never edit the code or run commands.
- **A role that the user picks and keeps** for the whole conversation, or handoffs from one role to another.
- **A named worker** with a fixed model or fixed permissions, which other agents call as a subagent.

Where the line falls depends on the tool:

| | Copilot in VS Code | Claude Code | Codex |
|---|---|---|---|
| Agent file | `.github/agents/*.agent.md` | `.claude/agents/*.md` (subagents) | `.codex/agents/*.toml` |
| How an agent is used | You pick it in the dropdown, or another agent calls it as a subagent | The main agent delegates to it as a subagent; `claude --agent` makes it the main one | Only as a subagent, when your prompt, `AGENTS.md` or a skill asks for one |
| Its own context | Only as a subagent | Yes | Yes |
| A skill can restrict tools | No | For one turn, with `disallowed-tools`; `allowed-tools` only pre-approves | No |
| A skill can set the model | No | Yes | No |
| A skill can run in its own context | `context: fork`, experimental | `context: fork`, pointing at a subagent with `agent:` | No field for it, but it can ask for subagents |

In Copilot, skills can't restrict tools or set the model, so a read-only Engineering Reviewer has to be an agent. In Claude Code you would write it as a skill with `context: fork`, pointing at a subagent that holds the list of tools: the subagent is still there, but you only ever call the skill.

</details>

## 5. Run the review

1. Open a **New Chat**. In the agent dropdown, where it says **Agent**, select **engineering-reviewer**. Keep **Auto** and **Interactive**: you want to see and allow each Docling call.
2. Send:

   ```text
   Review the documentation of this repo against the code.
   ```

3. Select **Allow** when it asks to run a Docling tool. Converting the scanned minutes takes up to a minute: that's OCR at work.
4. Watch the tool calls go by in the chat: a conversion, an outline, a few searches and reads of single anchors. No whole documents.
5. Open `docs/reviews/engineering-review.md` and read it. For each inconsistency, open the code it cites and check that it says what the report claims.

How many inconsistencies did it find? Don't look at the solution until you have checked the report yourself.

> [!TIP]
> **Try the skill on its own.** In a new chat with the normal **Agent**, send *"What does the meeting minutes PDF say about ratings?"*. If it uses `review-documents` without you typing `/`, its `description` works.

## 6. Commit

1. Open the **Source Control** panel.
2. Stage the files of this lesson: `.vscode/mcp.json`, `.github/skills/review-documents/`, `.github/agents/engineering-reviewer.agent.md`, `docs/requirements.pdf`, `docs/meeting-minutes.pdf`, `docs/reviews/_docling/`, `docs/reviews/engineering-review.md`, and any change to `docs/reviews/architecture-diagram.md`, `GLOSSARY.md` or `docs/adr/`. Leave `reviewer/` unstaged if you have it: it belongs to the extra lesson.
3. Generate a commit message with the **Sparkle** button and select **Commit**.

You end on `sorting`, with the Engineering Reviewer and its first report committed.

<details>
<summary>Solution</summary>

Your skill, your agent and your report will differ in the wording. A good result looks like this.

**The reviewer finds six inconsistencies**, seeded on purpose. The first three come from the diagram, through `review-diagram`; the other three from the documents, through `review-documents`:

| # | Source | It says | The code |
|---|---|---|---|
| 1 | Diagram | A **REST API (Flask)** that the browser calls at runtime | No API and no Python. `astro.config.mjs` has `output: 'static'`, and the pages query the database at build time. The `README.md` agrees with the code |
| 2 | Diagram | The database is **PostgreSQL** | **SQLite**: `src/lib/db.ts` uses `node:sqlite`, and `drizzle.config.ts` has `dialect: 'sqlite'` |
| 3 | Diagram | A **`Backers`** table | `db/schema.ts` defines only `publishers`, `categories` and `games` |
| 4 | `requirements.pdf`, **FR-03** (`#/texts/12`) | *"A game can belong to several categories"* | One category per game: `games.categoryId` in `db/schema.ts` is a single foreign key, and `src/types/game.ts` has `category: Category \| null` |
| 5 | `requirements.pdf`, **NFR-01** (`#/texts/20`) | *"The catalog updates in real time … without redeploying the site"* | The site is static: `output: 'static'`, `export const prerender = true` in `src/pages/index.astro` and `src/pages/game/[id].astro`, and `prebuild` loads `db/games.csv`. Any change needs a new build and deploy |
| 6 | `meeting-minutes.pdf`, **D2** (`#/texts/14`) | *"Game ratings are shown on a scale of 1 to 10, as whole numbers and without stars. Implemented in sprint 14."* | Still 0–5 with stars and one decimal: `clampRating` and `formatStarRating` in `src/lib/ratings.ts`, and `toFixed(1)` in `src/components/StarRating.astro` |

The rest of the documents matches the code. If your report flags any of these, it is a false positive:

- The other requirements: FR-01, FR-02, FR-04 to FR-09 and NFR-02 to NFR-06.
- Decisions D1 (SQLite stays) and D3 (the *Support This Game* button doesn't process contributions).
- The filtering and sorting you built: section 5 of the requirements leaves them out of version 1.2, so they are new work, not a contradiction.

Your anchors may differ if the agent converts the documents another way. What matters is that each finding points at a place in the document and at code you can open.

**A reference `SKILL.md`**, in `.github/skills/review-documents/SKILL.md`:

```markdown
---
name: review-documents
description: Read the PDF documents in docs/ (requirements, meeting minutes, scans) with the docling MCP server, by anchors, and check what they say against the code. Use when the user asks to review, read or check the requirements, the meeting minutes or other documents in docs/.
---

Read the PDF documents in `docs/` with Docling and compare what they say with the code of this repo. Read only the parts you need: a whole document in the context costs tokens and buries what matters.

## Rules

- The code is the source of truth.
- Only report. Don't change the code or the documents.
- Never paste a whole document into the chat. If `export_docling_document_to_markdown` is available, never call it without `max_size`.

## Steps

1. For each PDF in `docs/`, call `convert_document_into_docling_document` with its absolute path and keep the `document_key`. A scanned page can take a minute: Docling reads it with OCR.
2. Call `get_overview_of_document_anchors` to get the outline: the section titles and the anchor of each item (`#/texts/12`).
3. Call `search_for_text_in_document_anchors` with one or two words (`categories`, `real time`, `rating`) to find the items that matter, and `get_text_of_document_item_at_anchor` to read them. Read every item of short sections such as *Non-functional requirements* or *Decisions*.
4. For each requirement or decision that the code can confirm or contradict, find the evidence in the code: configuration (`astro.config.mjs`, `package.json`), the data layer (`db/schema.ts`, `src/lib/`), the types (`src/types/`), the pages and components (`src/pages/`, `src/components/`). Note the file and the line.
5. Return each discrepancy with the document, the anchor, the quoted text, what the code does and the file and line that prove it.

If the Docling tools are not available, say so and read the converted Markdown in `docs/reviews/_docling/` instead, citing the section instead of the anchor.
```

**A reference agent**, in `.github/agents/engineering-reviewer.agent.md`:

```markdown
---
name: engineering-reviewer
description: Review the documentation of Tailspin Toys (requirements, meeting minutes, architecture diagram and README) against the code, and write one report of the inconsistencies.
tools: ['read', 'search', 'edit', 'docling/convert_document_into_docling_document', 'docling/get_overview_of_document_anchors', 'docling/search_for_text_in_document_anchors', 'docling/get_text_of_document_item_at_anchor']
---

You are the Engineering Reviewer of Tailspin Toys. You find where the requirements, the architecture and the implementation disagree. You report; you never fix.

## Sources

- The PDF documents in `docs/`: use the `review-documents` skill.
- The architecture diagram `docs/architecture.png`: use the `review-diagram` skill.
- The `## Architecture` section of `README.md`.
- The code, which is the source of truth. When two documents disagree, check both against the code.

## Report

Write `docs/reviews/engineering-review.md`. It is a deliverable the user asks for, so write it even though the custom instructions say "Do not generate summary markdown files": that rule is about summaries of your own work, not about this report.

- A table with the columns `Source A | Source B | Discrepancy | Evidence`, one row per inconsistency. In `Evidence`, cite the anchor or the section of the document, and the file and line of the code.
- A section `## Checked and consistent`, with what you checked that matches.

Then answer in the chat with the number of inconsistencies and the path of the report.
```

**The report**, in `docs/reviews/engineering-review.md`, starts like this. Yours cites lines, which differ from repo to repo:

```markdown
| Source A | Source B | Discrepancy | Evidence |
|---|---|---|---|
| Diagram: REST API (Flask) called at runtime | Code | There is no API: the site is static and reads the database at build time | `astro.config.mjs`: `output: 'static'`; `src/pages/index.astro`: `prerender = true` |
| Diagram: PostgreSQL | Code | The database is SQLite | `src/lib/db.ts`: `node:sqlite`; `drizzle.config.ts`: `dialect: 'sqlite'` |
| Diagram: `Backers` table | Code | The table doesn't exist | `db/schema.ts`: only `publishers`, `categories`, `games` |
| `requirements.pdf` FR-03 (`#/texts/12`) | Code | Several categories per game, but each game has one | `db/schema.ts`: `games.categoryId`; `src/types/game.ts`: `category: Category \| null` |
| `requirements.pdf` NFR-01 (`#/texts/20`) | Code | Real-time updates, but the site only changes with a new build | `astro.config.mjs`: `output: 'static'`; `package.json`: `prebuild` |
| `meeting-minutes.pdf` D2 (`#/texts/14`) | Code | Ratings 1–10 without stars, but still 0–5 with stars | `src/lib/ratings.ts`: `clampRating`, `formatStarRating`; `src/components/StarRating.astro`: `toFixed(1)` |
```

**`git log --oneline`** shows, from newest to oldest, something like:

```text
7a1f0c3 Add Engineering Reviewer agent, review-documents skill and Docling MCP
c41d8e2 Add review-diagram skill and architecture diagram report
f3c9a1e Set up Matt Pocock's skills and the glossary
```

</details>

## At home

### Watch the tokens you save (~5 min)

Reading by anchors is not only tidier: it puts fewer tokens in the context. You can see it in the **context window indicator** of the chat, the small gauge in the chat input. Hover over it to see the tokens in use and how they split into categories such as *Tool definitions* and *Tool results*.

1. In `.vscode/mcp.json`, add `"generation"` at the end of the `args` of `docling`, and restart the server (**MCP: List Servers** > **docling** > **Restart Server**). That group brings `export_docling_document_to_markdown`, which dumps a whole document.
2. **A.** Open a **New Chat** with the normal **Agent** and the **Auto** model, and send:

   ```text
   Read docs/requirements.pdf with the docling tools and tell me what it says about categories.
   ```

   When it answers, hover over the context window indicator and note *Tool definitions* and *Tool results*. Check in the tool calls whether it exported the whole document.
3. **B.** Open a **New Chat**, select **engineering-reviewer**, keep **Auto** and send **the same prompt**. Hover over the indicator again and compare.
4. Remove `"generation"` from the `args` and restart the server.

What you should see:

- **Tool definitions** go down in B. Agent A sees every tool of every server, and Docling alone brings 21 when `generation` is on. The reviewer sees only its `tools:`.
- **Tool results** go down in B: an outline and a few anchors instead of the whole document.

As a reference, these are the sizes of the Docling tool results and definitions for the workshop documents, measured on the server. The indicator shows more, because it also counts the system prompt, your messages and the other servers:

| What goes into the context | Characters | ≈ tokens |
|---|---:|---:|
| Definitions of the Docling tools, with `generation` (21 tools) | 22,800 | 5,700 |
| Definitions of the Docling tools, without `generation` (10 tools) | 10,700 | 2,700 |
| `requirements.pdf` exported whole to Markdown | 3,000 | 760 |
| Its outline of anchors | 1,400 | 360 |
| One search, such as `categories` | 130 | 35 |

With a two-page document, the saving in results is small; the definitions weigh more. With real documents of dozens of pages it is the other way round: a nine-page paper takes about 13,000 tokens exported whole, and about 2,000 read by anchors.

### Let the reviewer read the issues (~2 min to set up)

Your repo has issues, and some of them say things about the app too. The reviewer left them out because reading them needs `gh`, and `gh` needs the terminal. To add them:

1. Add `execute` to the `tools:` of `.github/agents/engineering-reviewer.agent.md`.
2. Add a source to its body: *"The open issues of the repo: list them with `gh issue list --state open --json number,title,body` and check what they say against the code."*
3. Run the review again, and select **Allow** when it asks to run `gh`.

`execute` lets the agent run any command in your terminal. VS Code asks you before each one: read the command before you allow it.

## Summary

You built the Engineering Reviewer. You:

- connected an MCP server, Docling, by adding one entry to `.vscode/mcp.json`;
- wrote a skill that reads documents by anchors, including a scan read with OCR;
- created a custom agent that restricts its tools and puts two skills to work;
- ran a review that checks documents, diagram, README and code against each other, and checked its findings.

If you want to see the same reviewer built in code, outside VS Code, go on to *[Extra: orchestration in code](../extra-orchestration/)*.

## Resources

- [Custom agents in VS Code][vscode-agents]
- [Agent skills in VS Code][vscode-skills]
- [Add and manage MCP servers in VS Code][vscode-mcp]
- [Docling MCP][docling-mcp]
- [Docling][docling]
- [Subagents in Claude Code][claude-subagents]
- [Skills in Claude Code][claude-skills]

[ex3]: https://github-samples.github.io/copilot-workshops/real-world-development/vscode/3-mcp/
[mcp]: https://modelcontextprotocol.io/
[docling]: https://docling-project.github.io/docling/
[docling-mcp]: https://github.com/docling-project/docling-mcp
[vscode-agents]: https://code.visualstudio.com/docs/copilot/customization/custom-agents
[vscode-skills]: https://code.visualstudio.com/docs/copilot/customization/agent-skills
[vscode-mcp]: https://code.visualstudio.com/docs/copilot/customization/mcp-servers
[claude-subagents]: https://code.claude.com/docs/en/sub-agents
[claude-skills]: https://code.claude.com/docs/en/skills
