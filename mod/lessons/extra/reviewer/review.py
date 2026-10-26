"""The Engineering Reviewer, in code: three GitHub Copilot agents in a row.

1. diagram:     checks docs/architecture.png against the code (skill review-diagram).
2. documents:   checks the PDFs in docs/ against the code, with Docling (skill review-documents).
3. synthesizer: merges both into one report, docs/reviews/engineering-review.md.

Run it from this folder: uv run review.py
"""

import asyncio
import sys
from pathlib import Path

from agent_framework.github import GitHubCopilotAgent
from agent_framework.orchestrations import SequentialBuilder  # noqa: F401  (TODO 3)
from copilot.session import PermissionHandler

# The root of your Tailspin Toys repo: the agents read its code, and the report goes there.
REPO = Path(__file__).resolve().parent.parent
REPORT = REPO / "docs" / "reviews" / "engineering-review.md"

# Copilot tools that only read the repo: open a file (an image too), search text, find files.
READ_TOOLS = ["view", "rg", "glob"]

# The Docling MCP server, configured as in .vscode/mcp.json.
DOCLING = {
    "type": "stdio",
    "command": "docling-mcp-server",
    "args": ["--transport", "stdio", "conversion", "manipulation"],
    "env": {"DOCLING_MCP_CONVERSION_MODE": "local"},
    "tools": ["*"],
}
# The four Docling tools that review-documents needs. Copilot names MCP tools <server>-<tool>.
DOCLING_TOOLS = [
    "docling-convert_document_into_docling_document",
    "docling-get_overview_of_document_anchors",
    "docling-search_for_text_in_document_anchors",
    "docling-get_text_of_document_item_at_anchor",
]

# Added to each skill: in the pipeline, an agent hands its findings to the next one.
IN_A_PIPELINE = """

## In this pipeline

You are one step of a pipeline of agents. Don't write any file: return your findings as your answer, for the next agent."""

TASK = "Review the documentation of this repo against the code."


def skill(name: str) -> str:
    """The instructions of a skill of the repo, without its frontmatter: the same ones VS Code uses."""
    text = (REPO / ".github" / "skills" / name / "SKILL.md").read_text(encoding="utf-8")
    return text.split("---", 2)[2].strip()


def options(tools: list[str], mcp_servers: dict | None = None) -> dict:
    """Options shared by every agent: Auto model, the repo as working directory, and only these tools."""
    return {
        "model": "auto",
        "timeout": 900,  # seconds per agent: OCR of the scanned minutes takes a while
        "working_directory": str(REPO),
        "available_tools": tools,
        # The agent can call only the tools above, and none of them writes: allow them all.
        "on_permission_request": PermissionHandler.approve_all,
        "mcp_servers": mcp_servers,
    }


# The example agent: its instructions are the review-diagram skill, and it can only read the repo.
def diagram_agent() -> GitHubCopilotAgent:
    return GitHubCopilotAgent(
        skill("review-diagram") + IN_A_PIPELINE,
        name="diagram",
        default_options=options(READ_TOOLS),
    )


# TODO 1: documents_agent(), like diagram_agent(), with the review-documents skill.
# It reads the repo and calls the four Docling tools, so it needs mcp_servers={"docling": DOCLING}.


# TODO 2: synthesizer_agent(), with instructions of its own. It plays the engineering-reviewer agent:
# it reads the findings of the other two in the conversation, checks the Architecture section
# of README.md, and answers with the report only. The program saves that answer to REPORT.


async def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")  # so a Windows terminal can print any answer

    # TODO 3: chain diagram, documents and synthesizer with SequentialBuilder, print which agent
    # is working, and save the synthesizer's answer to REPORT. For now, the example agent runs alone.
    diagram = diagram_agent()
    async with diagram:
        print(f"-> {diagram.name} is working...")
        response = await diagram.run(TASK)
    print(response.text)


if __name__ == "__main__":
    asyncio.run(main())
