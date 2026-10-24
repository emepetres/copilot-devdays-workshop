---
title: "Matt Pocock's workflow"
---

Do this after *[Exercise 2 · Agent mode][ex2]*.

**Goal:** learn what a skill is, install [Matt Pocock's skills][pocock-skills] and use them to build the game list sorting: first you sharpen the idea with `/grill-with-docs`, then you build it with `/implement-lite`. It is an alternative to Plan mode, and the way you will work for the rest of the workshop.

Plan for **about 50 minutes**.

> [!IMPORTANT]
> **Where you should be**
>
> - Branch `filtering-vscode`, with the filtering of Exercise 2 working but **not committed** (you selected **Keep** at the end).
> - The *Auto* model selected in the chat.

> [!TIP]
> You can write to the agent in Spanish. The skills are in English, but the agent answers in the language you use.

## 1. Bring in the lesson material

From the root of your repo, in the VS Code terminal, run:

```shell
npx -y github:emepetres/copilot-devdays-workshop#mod-v1 lesson pocock
```

It copies the `implement-lite` skill to `.github/skills/implement-lite/SKILL.md`. If you already ran `setup` in the *[Extra prerequisites](../prerequisites/)*, the file is there and the command just says it is up to date.

## 2. Commit the filtering and create the `sorting` branch

The filtering of Exercise 2 is still uncommitted. Commit it on `filtering-vscode` and start a new branch, `sorting`, from there. Copy these three commands as they are: they leave out the material of the mod lessons, which you will commit later.

```shell
git add -A -- ':!docs' ':!reviewer' ':!.github/skills/implement-lite'
git commit -m "Add filtering by publisher and category"
git switch -c sorting
```

Check that the terminal shows `Switched to a new branch 'sorting'`.

> [!NOTE]
> **You stay on `sorting` for the rest of the workshop, Exercise 3 included.** The pull request you open in Exercise 3 will include the sorting as well as the filtering. That's fine: nobody merges it.

## 3. What is a skill?

A **skill** is a folder with a `SKILL.md` file that tells the agent **how to do** a specific task: run the tests, review a diagram, implement a ticket… The agent loads it only when it needs it, so a project can have many skills without filling the context. Skills are portable: the same folder works in Copilot, Claude Code and other agents.

Tailspin Toys already has one. Open `.github/skills/quality-checks/SKILL.md` and look at its parts:

- **The frontmatter**, between the `---` lines:
  - `name`: how you call it. It must match the folder name.
  - `description`: what it does and when to use it. The agent only reads this part until it decides to use the skill, so it is the most important line of the file.
  - `allowed-tools`: the tools the skill can use, here only the shell.
- **The body**: the instructions themselves. A quick reference of `npm` commands, how to debug failures and what must pass before a commit.

You can call a skill in two ways:

- **With `/`**: type `/quality-checks` in the chat.
- **In natural language**: *"Run the quality checks"*. The agent matches your request against the `description`.

Skills can live in the repo, in `.github/skills/`, so the whole team shares them, or in your user folder, so you have them in every project.

## 4. Install Matt Pocock's skills

[Matt Pocock's skills][pocock-skills] are a set of small skills for working with agents like an engineer: sharpen the idea by answering questions, turn it into issues, implement with tests, review. They are published as an **agent plugin**, a package of skills you install once and that updates itself.

1. Check that you have `chat.plugins.enabled` turned on, as the *[Extra prerequisites](../prerequisites/#enable-agent-plugins)* say.
2. Open the Command Palette (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>, or <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> on macOS) and run **Chat: Install Plugin From Source**.
3. Enter the source:

   ```text
   https://github.com/mattpocock/skills
   ```

4. Type `/` in the chat: you should now see skills such as `grill-with-docs`, `tdd` and `setup-matt-pocock-skills`.

The plugin is installed for your user, not for this repo, so you will have it in your own projects too. Install it as it is: this lesson uses the skills unmodified.

## 5. Set up the skills for this repo

Some of the skills read and write GitHub issues, and they need to know where the issues are and where the docs go. One skill sets that up, once per repo.

1. Open a **New Chat** and select **Agent** and the **Auto** model.
2. Send:

   ```text
   /setup-matt-pocock-skills
   ```

3. Accept the default answer to each question:
   - **Issue tracker**: GitHub, through `gh`.
   - **Triage labels**: the default ones (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`).
   - **Domain docs**: single-context, one `GLOSSARY.md` and `docs/adr/` at the root.
   - **Instructions file**: Tailspin Toys has neither `AGENTS.md` nor `CLAUDE.md`, so it asks which one to create. Choose **`AGENTS.md`**.
4. Select **Continue** whenever it asks to run a command.

When it finishes you have `docs/agents/` with three short files and an `AGENTS.md` that points to them. Open them: they are plain Markdown that you can edit by hand.

## 6. Sharpen the idea with `/grill-with-docs`

The backlog has an issue called **"Allow users to sort the game list"**. Its acceptance criteria leave decisions open. For example, where do the games without a star rating go when you sort by rating? Instead of letting the agent guess, you let it **grill** you: it asks you questions, one round at a time, with its recommended answer, until you both agree on what to build.

`/grill-with-docs` also writes down what you agree on: the project's words go to `GLOSSARY.md` as soon as they are settled, and the hard-to-reverse decisions, if any, go to an ADR in `docs/adr/`.

1. Open a **New Chat**, still in **Agent** with **Auto**.
2. Send:

   ```text
   /grill-with-docs the GitHub issue "Allow users to sort the game list". Use the /grilling and /domain-modeling skills. Keep it to 2 or 3 rounds of questions. When we agree, post the refined spec as a comment on that issue with gh.
   ```

3. Answer each round. You can accept the recommended answer, change it or ask why. Keep it short: **15 minutes at most**.
4. When it is done, check the result:
   - `GLOSSARY.md` at the root, with terms such as *sort order* or *star rating*.
   - Maybe an ADR in `docs/adr/`. Most sessions don't produce any, and that's fine.
   - A new comment on the issue in GitHub, with the refined spec.

> [!NOTE]
> **Why name `/grilling` and `/domain-modeling` in the prompt?** `grill-with-docs` is only one line: it delegates to those two skills. Claude Code has a *Skill tool* that loads them automatically; Copilot doesn't, so you name them in the prompt so that it loads them ([mattpocock/skills#1052][issue-1052]). If you see every question at once, with no recommendations and no `GLOSSARY.md`, the agent didn't load them: ask it to.

## 7. The other way: Plan mode

Copilot has its own way to think before building: **Plan mode**. Select **Plan** in the agents dropdown of the Chat view, describe what you want, and the agent researches the code and proposes a step-by-step plan for you to review before any change is made. When you are happy, you hand the plan over to the agent to implement.

| | Plan mode | `/grill-with-docs` |
|---|---|---|
| Who asks | You ask, the agent proposes a plan | The agent asks you, round by round |
| What is left behind | The plan, in the conversation | `GLOSSARY.md`, ADRs and the spec in the issue |
| Best for | Changes whose *what* is already clear | Ideas that are still fuzzy or have open decisions |

Both are valid. Here you use grilling because its output stays in the repo and in the issue, and the Engineering Reviewer will read those layers later. Plan mode is also your fallback: if the grilling doesn't wait for your answers and just carries on ([mattpocock/skills#1087][issue-1087]), use Plan mode with the same issue.

## 8. Build it with `/implement-lite`

With the spec agreed, the agent builds it. Matt Pocock's `implement` skill reads the ticket, builds it test-first with `/tdd`, reviews the result with `/code-review` and commits. For the workshop you use **`implement-lite`**, the variant that came with the lesson material. Open `.github/skills/implement-lite/SKILL.md`: it is short. Compared with `implement`, it:

- uses `/tdd` in the same way, writing a failing test first and then the code that makes it pass;
- runs the project's checks with `/quality-checks`, the skill you just read;
- replaces `/code-review` with a light review of its own diff against the spec and `GLOSSARY.md`. `/code-review` starts subagents and takes much longer than the time you have;
- commits to the current branch, without pushing or opening a pull request.

1. Open a **New Chat**, still in **Agent** with **Auto**. Starting fresh is part of the workflow: everything agreed is in the issue and in `GLOSSARY.md`, not in the old conversation.
2. Send:

   ```text
   /implement-lite the GitHub issue "Allow users to sort the game list", following the refined spec in its comments.
   ```

3. Select **Continue** whenever it asks to run a command. Watch the cycle: a failing test, the code, the test passing, and again.
4. When it finishes, run the app (`npm run dev`, if it isn't running) and try the sorting at <http://localhost:4321>.

> [!TIP]
> **At home, try the original.** In your own projects, use `/implement`, which comes with the plugin, with its full `/code-review`. It takes longer, but the review runs in separate subagents, so it isn't biased toward the code it just wrote.

## 9. Commit the rest

`implement-lite` commits the sorting. The files from the setup and the grilling may still be uncommitted.

1. Open the **Source Control** panel.
2. Stage the files of this lesson, if they are still there: `AGENTS.md`, `docs/agents/`, `GLOSSARY.md`, `docs/adr/` and `.github/skills/implement-lite/`. Leave any other mod material (`docs/*.pdf`, `docs/architecture.png`, `reviewer/`…) unstaged: its lessons will commit it.
3. Generate a commit message with the **Sparkle** button and select **Commit**.

You end on `sorting`, with the filtering, the sorting and the Matt Pocock setup committed.

<details>
<summary>Solution</summary>

Your result will differ in the details, because the agent and your answers decide them. A good one looks like this.

**The grilling** settles questions such as:

- Which sort orders exist: title A–Z, title Z–A and star rating, highest first.
- Where unrated games go when you sort by rating: at the end, ordered by title.
- What the default order is: title A–Z, as the list is today.
- Whether sorting and filtering combine: yes, the sorting applies to the filtered list.
- Whether the order is kept in the URL: usually no, to keep the change small.

**`GLOSSARY.md`** has a few short terms, for example:

```markdown
## Sort order

The order in which the game list shows the games: title A–Z, title Z–A or star rating.

## Star rating

The 0–5 score of a game. A game may have no star rating (unrated).
```

**The comment on the issue** restates the acceptance criteria with those decisions: the three orders, unrated games last, the default, and that sorting keeps the active filters.

**The code**, in the commit of `/implement-lite`:

- A pure helper in `src/lib/` that sorts a list of games by a sort order, with unit tests next to it (A–Z, Z–A, rating with unrated games last, ties).
- A labelled `<select>` with a `data-testid` on the games page, and a small Astro `<script>` that reorders the game cards. The site is static, so sorting happens in the browser, like the filtering.
- A Playwright test in `e2e-tests/` that changes the sort order and checks the order of the cards.
- `/quality-checks` passing: unit tests, lint and type checks.

**`git log --oneline`** shows, from newest to oldest, something like:

```text
f3c9a1e Add files from Matt Pocock's workflow
9b2d7e4 Add sorting of the game list
5e8a0c2 Add filtering by publisher and category
```

</details>

## Summary

You have worked the way you will work for the rest of the workshop. You:

- learned what a skill is, reading `quality-checks`;
- installed Matt Pocock's skills as a plugin and set them up for your repo;
- sharpened an issue with `/grill-with-docs`, leaving a glossary and the spec in the issue;
- compared it with Plan mode;
- built the sorting with `/implement-lite`: tests first, checks, a light review and a commit.

You now have three layers that the Engineering Reviewer will compare later: the requirements (the issue), the domain (the glossary and any ADR) and the code.

Next, *[Exercise 3 · Testing your feature with the Playwright MCP server][ex3]*, on the `sorting` branch. If you are short on time, skip it and go to *[A skill that reads images](../image-skill/)*.

## Resources

- [Matt Pocock's skills][pocock-skills]
- [Agent skills in VS Code][vscode-skills]
- [Agent plugins in VS Code][vscode-plugins]
- [Plan mode in VS Code][vscode-plan]

[ex2]: https://github-samples.github.io/copilot-workshops/real-world-development/vscode/2-agent-mode/
[ex3]: https://github-samples.github.io/copilot-workshops/real-world-development/vscode/3-mcp/
[pocock-skills]: https://github.com/mattpocock/skills
[issue-1052]: https://github.com/mattpocock/skills/issues/1052
[issue-1087]: https://github.com/mattpocock/skills/issues/1087
[vscode-skills]: https://code.visualstudio.com/docs/copilot/customization/agent-skills
[vscode-plugins]: https://code.visualstudio.com/docs/copilot/customization/agent-plugins
[vscode-plan]: https://code.visualstudio.com/docs/copilot/agents/planning
