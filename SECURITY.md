# Security — collection config

## Closed in pure helpers

| Issue | Behavior |
| --- | --- |
| List longer than 24 | refused |
| Market fee outside 0..0.15 | refused |
| `allowNotify: false` plus a notify list | mismatch warning |
| Mutation | not performed by the checklist |

## Not closed

| Concern | Guidance |
| --- | --- |
| Live collection row | Host read |
| Fee update transaction | Needs a separate confirmed WharfKit flow |
| React page | Not the test surface |

## Attack angles

1. One-click config write from the inspector.  
2. Hiding the market fee from the buyer explanation.  
3. Inventing a collection field AtomicAssets does not store.  
4. Recomputing the fee inside the buy triple (the markets lab must not).

## Honesty limits

Checklist only. Buyer pays the listed price; the split is read live at settlement.
