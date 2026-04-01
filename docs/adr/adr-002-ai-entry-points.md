[← Back to Index](../INDEX.md)

# ADR-002: Add AI Assistant Entry Points for Coding Tools

## Status
Accepted

## Date
2026-04-01

## Context
The team uses multiple AI coding assistants (Cursor, Claude Code, GitHub Copilot, Kiro, Gemini, OpenAI Codex). Each tool has its own convention for reading project-level instructions, and without explicit configuration, assistants may ignore project conventions, generate inconsistent code, or miss existing documentation.

## Decision
Create a single source of truth (`docs/ASSISTANT.md`) containing AI-specific rules and a documentation map, then add thin entry points for each tool that redirect to it:

| File | Tool |
|------|------|
| `CLAUDE.md` | Claude Code |
| `GEMINI.md` | Gemini CLI / Gemini Code Assist |
| `AGENTS.md` | OpenAI Codex (cross-tool standard) |
| `.cursorrules` | Cursor |
| `.github/copilot-instructions.md` | GitHub Copilot |
| `.kiro/settings/steering.md` | Kiro |

## Rationale
- One source of truth avoids duplicating rules across multiple config files.
- Each tool automatically picks up its own entry point — no manual setup per developer.
- Adding a new tool only requires a one-line file pointing to `ASSISTANT.md`.
- `AGENTS.md` is an emerging cross-tool standard (Linux Foundation / Agentic AI Foundation), future-proofing the setup.

## Consequences
- Every AI tool used by the team will read the golden path and ADRs before generating code.
- New documentation must be registered in `docs/INDEX.md` and referenced in `docs/ASSISTANT.md` to be discoverable by assistants.
- Human-readable docs (`INDEX.md`) remain separate from AI instructions (`ASSISTANT.md`).
