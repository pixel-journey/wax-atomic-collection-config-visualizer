# Sources

| Source | Use |
| --- | --- |
| [Managing AA collections](https://docs.wax.io/build/tutorials/howto_atomicassets/collection_js) | Official flow |
| [atomicassets-contract v2.0.0](https://github.com/atomicassets/atomicassets-contract/releases/tag/v2.0.0) | Collection fields |
| [schema explorer](https://github.com/pixel-journey/wax-atomic-template-and-schema-explorer) | Schema layer |
| [atomic markets](https://github.com/pixel-journey/wax-atomic-markets-and-trading-interface) | Buyer pays listed price; fee is read live |
| [wharfkit/skill](https://github.com/wharfkit/skill) | SessionKit for a later confirmed update |

## Product facts

- Lists longer than **24** are refused. Market fee is **0 to 0.15**.
- AtomicMarket reads the fee **live at settlement**. The buyer still pays the listed price.
- `allowNotify: false` with a notify list is a mismatch warning.
- Pure helpers are what tests run. The React visualizer is not the test surface.
- Do not invent Atomic fields. Inspect and mutate stay separate.

## Portability

The checks are chain-agnostic. The REST host and the contract account are local. WAX mainnet AtomicAssets is V1 unless a pinned source says the target is V2.
