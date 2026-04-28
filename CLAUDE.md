## Project: AI Personal Finance

This repo is currently a fresh Git repository (no source files yet). Use this file to keep future work consistent as the project grows.

## Quick start

- If you add a runtime (Node/Python/etc.), also add:
  - a lockfile (`package-lock.json`, `poetry.lock`, etc.)
  - a short `README.md` with setup + run commands

## Conventions

- Keep commits small and descriptive.
- Prefer adding tests alongside new logic.
- Avoid committing OS/editor artifacts (e.g. `.DS_Store`).

## Recommended structure (when code is added)

- `src/`: app/library code
- `tests/`: automated tests
- `docs/`: project documentation
- `.env.example`: example environment variables (never commit real secrets)

## For AI assistants

- Ask for clarification when requirements are ambiguous; otherwise make reasonable defaults and document them in the PR/commit message.
- Do not add large dependencies without a clear need.
- If you introduce scripts/commands, ensure they work on macOS (darwin) and document them in `README.md`.

