# wax-atomic-collection-config-visualizer

> **Home for collection fee, auth lists, and notify lists.** Lists longer than 24 are refused. Market fee is 0 to 0.15. AtomicMarket reads the fee live at settlement: the buyer pays the listed price, the split moves. The course is [EDUCATION.md](./EDUCATION.md). Related rules live in [wax-atomic-template-and-schema-explorer](https://github.com/pixel-journey/wax-atomic-template-and-schema-explorer) (schemas, templates) and [wax-atomicassets-v2-action-previews](https://github.com/pixel-journey/wax-atomicassets-v2-action-previews) (author, RAM, offers). Do not open a new micro-repo for a single check that belongs here.

**Official sources, still live:**
- [Managing AA Collections](https://docs.wax.io/build/tutorials/howto_atomicassets/collection_js)
- [How-To AtomicAssets](https://docs.wax.io/build/tutorials/howto_atomicassets)
- [atomicassets-contract v2.0.0](https://github.com/atomicassets/atomicassets-contract/releases/tag/v2.0.0)

> **Status:** 🔄 Hardened for public review (PX Perfection Standard v1.1)
> **Category:** Atomic Ecosystem – Collection Configuration
> **Parent Catalog:** [wax-ecosystem-blueprint-catalog](https://github.com/pixel-journey/wax-ecosystem-blueprint-catalog)
> **Related Perfected Foundations:** [pixel-journey-standards](https://github.com/pixel-journey/pixel-journey-standards) · [pixel-journey-templates](https://github.com/pixel-journey/pixel-journey-templates) · [gitbook-docs](https://github.com/pixel-journey/gitbook-docs)
> **Trust label:** `educational-reference` — the pure functions in `src/collectionRules.ts` are tested (`npm test`). The React visualizer is not. See [VERIFICATION-LOG.md](./VERIFICATION-LOG.md).

**Goal:** Deliver a premium, educational reference for understanding, inspecting, and reasoning about AtomicAssets **collection-level** configuration on WAX — market fee, notify accounts, author/authorized accounts, and how those settings affect players and marketplaces. Collection config is small in surface area and large in consequence.

---

## 1. Educational core — why collection config matters

| Concept | Simple explanation | Why it matters |
|---|---|---|
| **Collection** | Top-level Atomic namespace | Scopes schemas, templates, assets |
| **Market fee** | Fee taken on market sales (where supported) | Creator revenue + player cost |
| **Notify accounts** | Accounts notified on relevant Atomic actions | Ops, bots, analytics, safety |
| **Author / authorized accounts** | Who can change collection data | Governance and compromise surface |
| **Allow notify** | Whether notification behavior is enabled | Integrations either work or silently don't |

Exact field names and capabilities depend on AtomicAssets contract version — **always verify against current docs and a live API response** (see VERIFICATION-LOG.md).

### Common issues

| Issue | Impact | How this blueprint helps |
|---|---|---|
| Fee misunderstood | Player anger or lost revenue | Plain-language impact panel |
| Empty notify list | Missed operational signals | Checklist + recommendations |
| Unclear authority | Security risk | Surface author/authorized context |
| Config treated as static | Drift from product goals | Re-inspection patterns |
| `allowNotify: false` with notify list set | Silent notification failure | Mismatch warning in checklist |

### Learning outcomes

- Explain collection-level settings in plain language.
- Spot missing notify accounts or odd fee values.
- Separate read-only inspection from privileged `set` actions.
- Pair this with template/schema exploration for full Atomic literacy.

## 2. Architecture

| Layer | Choice |
|---|---|
| Framework | Next.js 15 + TypeScript (strict) |
| UI | Tailwind + Pixel Journey patterns |
| Data | AtomicAssets public API or fixtures |
| Logic | Pure impact / checklist helpers in `examples/configInsights.ts` |

```
/examples/
  types.ts                 CollectionConfig, ImpactNote, ChecklistItem
  configInsights.ts        PURE: describeMarketFee, buildImpactNotes, buildChecklist
  configInsights.test.ts   Vitest (add when you install vitest)
  CollectionConfigSummary.tsx
  ImpactPanel.tsx
  ConfigChecklist.tsx
  demo.tsx
  live/atomicassets.ts     I/O: fetchCollectionConfig + mapCollection
```

Design decisions:

- **Read-first.** Writes are privileged; the core demo never implies unauthenticated mutation.
- **Every numeric fee is explained in human terms** (bps -> percent).
- **Recommendations cite the triggering field** so you can trace advice to data.

## 3. Integration levels

| Level | Scope |
|---|---|
| **Minimal** | Display fee + notify accounts |
| **Recommended** | Summary + impact panel + checklist |
| **Advanced** | Live sync, config-change history, multi-collection compare |

## 4. Best practices

**Do**

- Re-read config after any on-chain update.
- Document why each notify account exists.
- Treat market fee as a product decision, not only a chain field.
- Label legacy/shared-platform integrations with trust tags (`recovery-documentation`, `recommended-for-new-value`, `avoid-new-value`) per [ECOSYSTEM-RESILIENCE.md](https://github.com/pixel-journey/wax-ecosystem-blueprint-catalog/blob/main/ECOSYSTEM-RESILIENCE.md).

**Don't**

- Hide the fee from stakeholders.
- Leave notify empty "for later" on production collections.
- Mix inspect UI with one-click config mutation without strong confirmations.
- Invent collection fields Atomic does not use (the `spec.yaml` invariant).

## 5. Edge cases

- `market_fee` returned as a fraction string (`"0.05"`) vs integer bps — `mapCollection` handles both; confirm against a live response.
- `allow_notify` absent from payload — treat as unknown (`undefined`), not false.
- Empty `notify_accounts` array vs missing field — both normalize to `[]`.
- Collection name with mixed case — always lowercased before the request.
- 404 on unknown collection — surface as "collection not found," not a generic error.

## 6. Antelope portability

AtomicAssets is deployed on several Antelope chains. The REST shape is similar; contract account names and indexer URLs differ. Swap `DEFAULT_ATOMIC` and re-verify field semantics. The pure helpers in `configInsights.ts` are chain-agnostic.

## 7. Verification status

See [VERIFICATION-LOG.md](./VERIFICATION-LOG.md). The fee-conversion logic (fraction -> bps) is the highest-risk claim and is explicitly marked untested pending a live sample.

## 8. Related blueprints

- `wax-atomic-template-and-schema-explorer`
- `wax-blends-creator-and-visualizer`
- `wax-drops-and-pack-opening-experience`

## 9. License

MIT — Pixel Journey. Educational, practical interfaces for public blockchain infrastructure.
