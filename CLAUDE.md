## AI Personal Finance (local-first)

This is a **local-first AI personal finance app**. The goal is to build a **private financial operating system** (reduce manual financial work), not just a budgeting dashboard.

## Core principles (non-negotiable)

1. **Local-first wherever possible**
2. **Financial data remains private**
3. **Start simple; build in phases**
4. **Do not over-engineer**
5. **Every feature reduces manual financial work**
6. **Clear database models + clean UI**
7. **Avoid paid APIs unless explicitly approved**
8. **AI can assist categorization but never silently overrides user decisions**
9. **Ambiguous transactions go to a review queue**
10. **Imported statement data must be validated when possible**

## Initial stack

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Prisma**
- **SQLite**

Later (only when needed by the phase):
- **Ollama**
- **ChromaDB**
- **PDF parsing**
- **Forecasting**

## Build phases (roadmap)

- **V1**: Manual transaction ledger and dashboard
- **V2**: CSV import and categorization rules
- **V3**: AI-assisted categorization and correction memory
- **V4**: PDF statement parsing and balance verification
- **V5**: Multi-entity tracking and tax categories
- **V6**: Forecasting and anomaly alerts

## Product behavior guidelines

- **AI behavior**:
  - AI suggestions must be explicit (previewable) and user-confirmed.
  - Never auto-edit transactions without a visible audit trail and an undo path.
  - When uncertain, route to **Review Queue** instead of guessing.
- **Review Queue**:
  - Central place for ambiguous/unmatched imports, low-confidence categories, duplicate candidates, and validation failures.
  - Users can resolve items with a single action when possible (approve, split, merge, ignore, create rule).
- **Imports + validation**:
  - CSV import should detect duplicates and malformed rows.
  - When a statement provides totals/balances, validate computed totals/balances when feasible.
  - Preserve raw imported rows for traceability (but keep storage local).

## Engineering workflow (how we work)

- **Small steps**: implement the minimum that moves the current phase forward.
- **Before major changes**: write a short plan describing:
  - what we’ll build
  - which files we’ll modify/create
  - expected user-visible result
- **No unnecessary deps**: avoid adding heavy libraries until required by a phase.
- **Security/privacy**:
  - Do not introduce telemetry by default.
  - Never commit secrets; use `.env.example` when env vars are needed.
- **DX**:
  - Keep commits small and descriptive.
  - Prefer adding tests with new logic when practical.

## Suggested repo structure (once code exists)

- `app/` or `src/`: Next.js app code
- `components/`: shared UI components
- `lib/`: domain + data access helpers
- `prisma/`: Prisma schema + migrations
- `tests/`: automated tests
- `docs/`: project docs (import formats, rules, privacy model)

## Definition of done (per feature)

- **Works locally** with SQLite
- **Doesn’t leak data** off-machine by default
- **Clear UX** (especially around imports, review queue, and AI suggestions)
- **Data model is explicit** (Prisma schema is understandable and evolvable)
