# v2 notes — collection config

**Trust:** the helpers in `examples/configInsights.ts` explain a fee and a checklist. They are not a v2 test suite. The README's verification log already marks the fraction-to-bps conversion as untested.

AtomicAssets v2.0.0 (2026-08-03), from the contract release, not from a call this repo made:

- `addcolauth`, `addnotifyacc`, and `createcol` refuse lists longer than 24. Older collections above the cap can still remove entries.
- Author succession is its own flow: `createauswap`, `acceptauswap`, `rejectauswap`, table `authorswaps`. This visualizer does not model it.
- Native token backing is gone. Collection config never was the backing switch. Do not add a "back with WAX" control.
- AtomicMarket v2 reads `market_fee` live at settlement. A fee edit applies to listings that already exist. The buyer still pays the listed price; the split between seller and collection moves. `describeMarketFee` only prints bps. It does not compute that split.
- `setrampayer` / `setlastpayer` reassign who paid the asset's RAM. Not in this tree.

Full map: [ATOMICASSETS-V2.md](https://github.com/pixel-journey/wax-ecosystem-blueprint-catalog/blob/main/ATOMICASSETS-V2.md).
