# ARCHITECTURE.md — Atomic Collection Config Visualizer

## Design Intent

Make collection-level Atomic settings understandable and reviewable.

1. **Legibility** — fees and notify lists in plain language
2. **Impact first** — explain what a setting does for players and ops
3. **Read-before-write** — demos inspect; mutation is a separate privileged path
4. **Pure insights** — checklist rules are testable
5. **Accessibility** — summaries work without relying only on color

## Invariants

| # | Invariant |
|---|-----------|
| 1 | Market fee is always shown with a human-readable interpretation when possible |
| 2 | Notify accounts are listed explicitly (including empty state) |
| 3 | Recommendations cite the triggering field |
| 4 | UI does not imply the user can edit on-chain config without auth |
| 5 | Unknown/missing fields are labeled, not invented |

## Architecture

```
Collection config data (API or fixture)
        → types.ts
        → configInsights.ts (pure)
        → CollectionConfigSummary / ImpactPanel / ConfigChecklist
```

## Component Contracts

- **CollectionConfigSummary** — identity, fee, notify, flags
- **ImpactPanel** — plain-language consequences
- **ConfigChecklist** — pass/warn items from pure rules
- **configInsights** — `describeMarketFee`, `buildChecklist`, `buildImpactNotes`

## Extensions

Live multi-collection compare, change history, and tightly gated update flows with WharfKit previews.

---

*Pixel Journey*
