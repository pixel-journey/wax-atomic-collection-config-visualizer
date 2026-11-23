# AI handoff — collection config visualizer

## Agent tooling

```bash
git clone https://github.com/wharfkit/skill.git ~/.claude/skills/wharfkit
# https://github.com/atomicassets/atomic-knowledge — pin commit, AGENTS.md
```

| Source | Role |
| --- | --- |
| [Managing AA Collections](https://docs.wax.io/build/tutorials/howto_atomicassets/collection_js) | Official |
| [atomicassets-contract v2](https://github.com/atomicassets/atomicassets-contract/releases/tag/v2.0.0) | Collection fields |
| [schema explorer](https://github.com/pixel-journey/wax-atomic-template-and-schema-explorer) | Schema/template layer |
| [atomic-knowledge](https://github.com/atomicassets/atomic-knowledge) | Network before action |

## Non-negotiables

1. Lists longer than **24** are refused. Market fee is **0 to 0.15**.
2. AtomicMarket reads the fee **live at settlement** — buyer pays listed price; split moves.
3. Pure helpers in `collectionRules` / `configInsights` are tested; React visualizer is not the test surface.
4. Do not invent Atomic fields. Inspection UI must stay separate from mutation.
5. `allowNotify: false` with a notify list → mismatch warning.
6. Pure helpers are chain-agnostic; REST host and contract account are local.
7. Do not open a micro-repo for a single check that belongs here.

## Prompt seeds

- "Using buildChecklist and buildImpactNotes, review this collection config JSON. List warns first."
- "Add a read-only loader for collection [NAME]. Handle missing fee/notify calmly."
- "Design confirmation-gated WharfKit flow for market fee update — inspect ≠ mutate."
- "Refuse list length > 24."

## Do not

- Hide fee from stakeholders.
- One-click config mutation without strong confirmation.
- Invent collection fields Atomic does not use.
