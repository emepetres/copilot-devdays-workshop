---
name: implement-lite
description: "Implement a piece of work based on a spec or ticket, with a light review instead of code-review. A lighter variant of Matt Pocock's implement skill."
disable-model-invocation: true
---

Implement the work described by the user in the spec or ticket.

If the user passes a ticket reference, fetch it from the issue tracker, comments included, and state its title before starting. The refined spec may be in a comment. If the reference is ambiguous, ask.

Use the tdd skill where possible, at pre-agreed seams.

Run single test files regularly.

Once done, use the quality-checks skill to run the unit tests, lint and type checks. Fix whatever fails.

Then review your own diff (`git diff`) against the spec and `GLOSSARY.md`, if it exists:

- Does it do everything the spec asks, and nothing more?
- Does it use the glossary's terms, in code and in tests?
- Is anything left over: debug code, commented-out code, unused helpers?

Fix what you find and report it in a few lines. Do the review yourself: don't start subagents.

Commit your work to the current branch. Don't push and don't open a pull request.
