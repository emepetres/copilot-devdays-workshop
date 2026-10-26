---
title: "A skill that reads images"
---

Do this after *[Exercise 3 · Testing your feature with the Playwright MCP server][ex3]*, or after *[Matt Pocock's workflow](../pocock-workflow/)* if you skipped it.

**Goal:** write your own skill, `review-diagram`, that **sees** the architecture diagram of Tailspin Toys and checks it against the code. No text is extracted from the image: the model looks at the picture and understands its boxes, arrows and labels, as you do. You sharpen the idea with `/grill-with-docs`, write the skill with `/writing-for-agents` and run it. It is the first piece of the **Engineering Reviewer**.

Plan for **about 25 minutes**.

> [!IMPORTANT]
> **Where you should be**
>
> - Branch `sorting`, with the filtering and the sorting committed, from *[Matt Pocock's workflow](../pocock-workflow/)*. If you did Exercise 3, its changes are committed too, and the branch is published with a pull request.
> - The **Auto** model, optimized for **Efficiency**, selected in the chat.

> [!TIP]
> You can write to the agent in Spanish. The skill you write is in English, but the agent answers in the language you use.

## 1. Bring in the lesson material

From the root of your repo, in the VS Code terminal, run:

```shell
npx -y github:emepetres/copilot-devdays-workshop#mod-v1 lesson images
```

It copies the architecture diagram to `docs/architecture.png`. If you already ran `setup` in the *[Extra prerequisites](../prerequisites/)*, the file is there and the command just says it is up to date.

## 2. Let the agent look at the diagram

Open `docs/architecture.png` in VS Code. It is a whiteboard sketch of how Tailspin Toys is built: who calls whom, and where the data lives. Diagrams like this one are drawn once and then the code moves on without them.

Before writing a skill that depends on it, check that the agent can **see** an image on disk. Copilot can read images in every plan, as long as the model supports it, and *Auto* picks one that does.

1. Open a **New Chat** and select **Agent**, the **Auto** model and the **Interactive** mode.
2. Send:

   ```text
   Look at docs/architecture.png and describe it: its boxes, its arrows and the text on them.
   ```

3. Check that the answer names the boxes you see, such as *Astro site* and *Browser*. Hover over the answer to see which model *Auto* chose.

> [!NOTE]
> **What just happened?** The agent read a PNG, with no text inside, and told you what it shows. The model behind *Auto* has **vision**: it receives the image itself and interprets the shapes, the arrows and the hand-drawn labels, the way you would. That is what makes this skill possible: any visual artifact, such as a diagram, a screenshot of the app or a photo of a whiteboard, can be checked against the code. In the next lesson you will see the other side: a scanned PDF doesn't reach the model as an image, so you need Docling and its OCR to read it.

> [!NOTE]
> **If the agent says it can't see the image**, attach it by hand: drag `docs/architecture.png` from the Explorer onto the chat input, or select **Add Context** > **Files & Folders** and pick it. Then send the prompt again. Reading images from disk needs VS Code 1.112 or later.

## 3. Sharpen the idea with `/grill-with-docs`

You know the method from *[Matt Pocock's workflow](../pocock-workflow/)*: instead of asking for the skill right away, let the agent grill you about it first.

1. Open a **New Chat**, still in **Agent**, **Auto** and **Interactive**. Remember: in Autopilot, the agent would answer its own questions.
2. Send:

   ```text
   /grill-with-docs a new skill, review-diagram, that checks docs/architecture.png against the code of this repo and reports where they disagree. Use the /grilling and /domain-modeling skills. Keep it to 1 or 2 rounds of questions. Don't write the skill yet.
   ```

3. Answer each round. These are the decisions that make the skill work well. Steer towards them if the agent doesn't propose them:
   - **The code is the source of truth.** Not the `README.md`, which is another document that can be wrong. The Engineering Reviewer compares the documents later.
   - **It reports, it doesn't fix.** Neither the code nor the diagram is changed.
   - **The report is a file**: `docs/reviews/architecture-diagram.md`, with a table *Element · Diagram · Code · Match?* and a list of the inconsistencies, each with the file and line that prove it.
   - **If it can't see the image, it stops** and asks you to attach it, instead of guessing from the file name.
4. Keep it short: **8 minutes at most**.

## 4. Write the skill with `/writing-for-agents`

`/writing-for-agents` is another of Matt Pocock's skills: it knows how to write instructions that an agent follows, and how to keep them short. Use it in the **same chat**, because what you agreed is still in the conversation.

1. Send:

   ```text
   /writing-for-agents write the skill we agreed as .github/skills/review-diagram/SKILL.md, in English. The report in docs/reviews/architecture-diagram.md is a deliverable the user asks for: say so explicitly in the skill, because the custom instructions of this repo say "Do not generate summary markdown files".
   ```

2. Open `.github/skills/review-diagram/SKILL.md` and check it, as you did with `quality-checks`:
   - `name` is `review-diagram`, the same as the folder. Otherwise VS Code doesn't load the skill.
   - The `description` says what it does **and** when to use it, for example *"Use when the user asks to review or check the architecture diagram"*.
   - The body reads the PNG from disk, takes the code as the source of truth, writes the report and doesn't fix anything.

> [!NOTE]
> **Why say it explicitly?** The custom instructions you met in Exercise 1 tell the agent not to write summary files when it finishes a task. That is a good rule, but a report the user asks for isn't a summary. Without that sentence, the agent may answer in the chat and never write the file.

## 5. Run it

1. Open a **New Chat**, still in **Agent**, **Auto** and **Interactive**. Starting fresh proves that the skill works on its own, without the conversation that created it.
2. Send:

   ```text
   /review-diagram
   ```

3. Select **Continue** whenever it asks to run a command.
4. Open `docs/reviews/architecture-diagram.md` and read it. For each inconsistency, open the file it cites and check that the code says what the report claims.

How many inconsistencies did it find? Don't look at the solution until you have checked the report yourself.

> [!TIP]
> **Try it in natural language.** In a new chat, send *"Check the architecture diagram against the code"*. If the agent uses `review-diagram` without you typing `/`, your `description` works.

## 6. Commit

1. Open the **Source Control** panel.
2. Stage the files of this lesson: `.github/skills/review-diagram/`, `docs/architecture.png`, `docs/reviews/architecture-diagram.md` and any change to `GLOSSARY.md` or `docs/adr/`. Leave the rest of the mod material (`docs/*.pdf`, `docs/reviews/_docling/`, `reviewer/`…) unstaged: its lessons will commit it. If `docs/architecture.png` went into the commit of Exercise 3, that's fine.
3. Generate a commit message with the **Sparkle** button and select **Commit**.

You end on `sorting`, with the `review-diagram` skill and its first report committed.

<details>
<summary>Solution</summary>

Your skill and your report will differ in the wording, because the agent and your answers decide them. A good result looks like this.

**The diagram has three inconsistencies**, seeded on purpose:

| # | In the diagram | In the code |
|---|---|---|
| 1 | A **REST API (Flask)** that the browser calls at runtime (`fetch /api/games`) | There is no API and no Python. `astro.config.mjs` has `output: 'static'`, and the pages query the database in their frontmatter at build time (`export const prerender = true` in `src/pages/index.astro`) |
| 2 | The database is **PostgreSQL** | It is **SQLite**: `src/lib/db.ts` opens it with `DatabaseSync` from `node:sqlite`, and `drizzle.config.ts` has `dialect: 'sqlite'` |
| 3 | A **`Backers`** table | `db/schema.ts` defines only `publishers`, `categories` and `games` |

The rest of the diagram matches the code: the browser loads the pages of the Astro site, Drizzle ORM queries the database at build time, and `db/games.csv` seeds it. If your report flags any of that, it is a false positive: ask the agent to show you the code that proves it.

**A reference `SKILL.md`**, in `.github/skills/review-diagram/SKILL.md`:

```markdown
---
name: review-diagram
description: Check the architecture diagram docs/architecture.png against the code and report where they disagree. Use when the user asks to review, check or validate the architecture diagram.
---

Compare the architecture diagram `docs/architecture.png` with the code of this repo, and write a report of where they disagree.

## Rules

- The code is the source of truth. Don't use `README.md` or other documents as evidence: they can be wrong too.
- Only report. Don't change the code or the diagram.
- The report is a deliverable the user asks for, so write it even though the custom instructions say "Do not generate summary markdown files". That rule is about summaries of your own work, not about this report.

## Steps

1. Read `docs/architecture.png` with your file-reading tool and look at it. If you can't see the image, stop and ask the user to attach it to the chat. Never describe the diagram from its file name or from other documents.
2. List every element of the diagram: each box (component, technology, database, table) and each arrow (who calls whom, and when: at build time or at runtime).
3. For each element, find the evidence in the code: configuration (`astro.config.mjs`, `drizzle.config.ts`, `package.json`), the data layer (`db/schema.ts`, `src/lib/`) and the pages (`src/pages/`). Note the file and the line.
4. Write `docs/reviews/architecture-diagram.md`, creating the folder if needed:
   - A table with the columns `Element | Diagram | Code | Match?`, one row per element. In `Code`, cite the file and line.
   - A section `## Inconsistencies`, with one item per element that doesn't match: what the diagram says, what the code says, and the file and line that prove it.
5. Answer in the chat with the number of inconsistencies and the path of the report.
```

**The report**, in `docs/reviews/architecture-diagram.md`, looks like this. Your report cites lines, which differ from repo to repo, so this one cites the files and what to look for in them:

```markdown
| Element | Diagram | Code | Match? |
|---|---|---|---|
| Site | Astro site serving HTML pages | `astro.config.mjs`: `output: 'static'` | ✅ |
| Runtime API | REST API (Flask), called by the browser with `fetch /api/games` | No API or Python code; pages query the database at build time (`src/pages/index.astro`: `prerender = true`, `getAllGames(getDatabase())`) | ❌ |
| Database | PostgreSQL | SQLite: `src/lib/db.ts` imports `DatabaseSync` from `node:sqlite`; `drizzle.config.ts` has `dialect: 'sqlite'` | ❌ |
| Data access | Drizzle ORM at build time | `src/lib/db.ts`: `drizzle-orm/sqlite-proxy`, `getDatabase()` used by the pages | ✅ |
| Tables | games, categories, publishers, Backers | `db/schema.ts` defines `publishers`, `categories` and `games` only | ❌ |
| Seed | `db/games.csv` seeds the database | `db/seed.ts` reads `db/games.csv`; `prebuild` runs `db:setup`, which runs it | ✅ |

## Inconsistencies

1. **REST API (Flask).** The diagram shows a Flask API that the browser calls at runtime. The site is fully static (`astro.config.mjs`: `output: 'static'`), and the pages read the database in their frontmatter at build time (`src/pages/index.astro`). There is no API and no Python in the repo.
2. **PostgreSQL.** The database is SQLite, through Node's built-in driver (`src/lib/db.ts`: `node:sqlite`) and Drizzle's SQLite dialect (`drizzle.config.ts`: `dialect: 'sqlite'`).
3. **`Backers` table.** `db/schema.ts` has no such table: only `publishers`, `categories` and `games`.
```

What matters is that each claim points at code you can open.

**`git log --oneline`** shows, from newest to oldest, something like:

```text
c41d8e2 Add review-diagram skill and architecture diagram report
f3c9a1e Set up Matt Pocock's skills and the glossary
9b2d7e4 Add sorting of the game list
```

</details>

## Summary

You wrote your first skill from scratch, the way you will write the rest, and it is a skill that sees. You:

- checked that the agent can see and understand an image on disk, and how to attach it when it can't;
- sharpened the skill with `/grill-with-docs` before writing a line of it;
- wrote it with `/writing-for-agents`, making clear that its report is a deliverable;
- ran it in a fresh chat and checked its findings against the code.

Next, *[The Engineering Reviewer with Docling MCP](../engineering-reviewer/)*: a custom agent that uses `review-diagram` together with a new skill that reads the PDFs.

## Resources

- [Agent skills in VS Code][vscode-skills]
- [Add context to chat in VS Code][vscode-context]
- [Matt Pocock's skills][pocock-skills]
- [Excalidraw][excalidraw], the whiteboard tool the diagram was drawn with

[ex3]: https://github-samples.github.io/copilot-workshops/real-world-development/vscode/3-mcp/
[pocock-skills]: https://github.com/mattpocock/skills
[vscode-skills]: https://code.visualstudio.com/docs/copilot/customization/agent-skills
[vscode-context]: https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context
[excalidraw]: https://excalidraw.com
