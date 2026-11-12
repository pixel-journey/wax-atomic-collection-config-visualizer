# Collection config — the small surface with large consequences

**Trust:** `educational-reference`. The pure functions in `src/collectionRules.ts` are tested. The React visualizer is not. Nothing here is a broadcast.

Official reading, still live:

- [Managing AA Collections](https://docs.wax.io/build/tutorials/howto_atomicassets/collection_js) on docs.wax.io
- [How-To AtomicAssets](https://docs.wax.io/build/tutorials/howto_atomicassets)
- [atomicassets-contract v2.0.0](https://github.com/atomicassets/atomicassets-contract/releases/tag/v2.0.0)
- [ATOMICASSETS-V2.md](https://github.com/pixel-journey/wax-ecosystem-blueprint-catalog/blob/main/ATOMICASSETS-V2.md)

This is the home for collection fee, auth lists, and notify lists. Schema and template rules live in [wax-atomic-template-and-schema-explorer](https://github.com/pixel-journey/wax-atomic-template-and-schema-explorer). Author succession, RAM payer, and offers live in [wax-atomicassets-v2-action-previews](https://github.com/pixel-journey/wax-atomicassets-v2-action-previews). Do not open a new micro-repo for a single check that belongs here.

---

## Scene

You are editing a collection. Someone pastes 25 accounts into the authorized list. Someone else sets the market fee to 0.20. Separately, a listing already exists at 100. You raise the fee from 0.05 to 0.10. The buyer still pays 100. The seller receives 90 instead of 95.

Predict, then run:

```bash
npm test
```

## Who this is for

- **Creators.** A collection name with no dot and no matching account must be 12 characters (`pixeljourney`). A short name fails with `Without special authorization, collection names must be 12 characters long`. A dotted name (`art.px`) needs the suffix account's authorization. A name that is already an account needs that account's authorization. This preview marks those two cases (`auth: "suffix"` or `"existing-account"`). It does not grant the auth.
- **Artists.** The market fee is your cut, capped at 15%. Changing it does not change the price a buyer already sees. It changes what you and the seller each receive at settlement.
- **Developers.** `allow_notify: false` plus any notify account fails (`Can't add notify_accounts if allow_notify is false`). A repeated authorized account fails. `is_account` is not checked, so a well-shaped name can still fail on chain.

`previewCreateCollection` is that shape check. Schemas and mint refusals are [wax-atomic-template-and-schema-explorer](https://github.com/pixel-journey/wax-atomic-template-and-schema-explorer). The official create walkthrough is [Managing AA Collections](https://docs.wax.io/build/tutorials/howto_atomicassets/collection_js).

## Beginner — the four knobs

| Knob | What it does | Official action |
| --- | --- | --- |
| Author | The account that owns the collection. Succession is a separate flow. | `createcol`, then `createauswap` |
| Authorized accounts | Who can create schemas, templates, and mint. Cap 24. | `addcolauth`, `remcolauth` |
| Notify accounts | Who gets notified on relevant actions. Cap 24. | `addnotifyacc`, `remnotifyacc` |
| Market fee | Fraction taken on market sales, 0 to 0.15. Read live at settlement. | `setmarketfee` |

The WAX docs walk the create path in [Managing AA Collections](https://docs.wax.io/build/tutorials/howto_atomicassets/collection_js). That page shows a 0.05 fee and a short auth list. It does not show the cap, the ceiling, or what happens to an existing listing when the fee changes.

---

## Intermediate — the three rules this course locks

### The 24-account cap

`addcolauth`, `addnotifyacc`, and `createcol` refuse lists longer than 24. The contract strings are `Can only have up to 24 authorized accounts` and `Can only have up to 24 notify accounts`. Older collections that already sit above the cap can still remove entries. This function does not model removal.

| Attack | Naive code | This lab | Test |
| --- | --- | --- | --- |
| 25 authorized accounts | allow | refuse with the contract string | `Array(25)` |
| 25 notify accounts | allow | refuse with the contract string | `Array(25)` |
| Exactly 24 | refuse | allow | size 24 |

### The fee ceiling

`MAX_MARKET_FEE` is 0.15 in the v2 header. The check is `0 <= market_fee && market_fee <= 0.15`. The contract string is `The market_fee must be between 0 and 0.15`.

| Attack | Naive code | This lab | Test |
| --- | --- | --- | --- |
| Fee 0.16 | allow | refuse | `previewMarketFee(0.16)` |
| Fee -0.01 | allow | refuse | negative |
| Fee 0.05 | print only | return fee and bps | 500 bps |

### The live fee

AtomicMarket v2 reads `market_fee` at settlement, not at listing time. The buyer still pays the listed price. The split between seller and collection moves. `previewSettlement(100, 0.05)` is 5 to the collection and 95 to the seller. `previewSettlement(100, 0.1)` is 10 and 90. The listed price is still 100. That sketch ignores the maker fee, the taker fee, and bonus fees.

`previewPayout` is `internal_payout_sale` from [atomicmarket v2.0.0](https://github.com/atomicassets/atomicmarket-contract/tree/v2.0.0). Each cut is `Math.trunc(fee * amount)`, the C++ cast to `uint64_t`. Maker, then taker, then the live collection fee, then a bonus fee whose counter matches and whose id is in `[start, end)`. The id at `end` is excluded. A 1% fee on 3 units truncates to 0. The seller remainder must be greater than 0, or the string is `Total fees leave no payout for the seller`. A royalty config changes who receives the collection cut, not the seller's remainder. Auction claims that name this payout live in [wax-atomic-markets-and-trading-interface](https://github.com/pixel-journey/wax-atomic-markets-and-trading-interface).

`previewRoyalty` is the recipient walk inside that collection cut, for one asset. A category whose list is empty is dropped, and the remaining weights are renormalized. Founders, then the template match, then already-matched attribute rules. Each step uses integer division. `10` split `1:2` pays `3` and `6`. The leftover `1` is the author's dust, not a fourth recipient. A fee of `0` returns before the bundle check. A positive fee on two assets is `Bundle listings retired`. Matching an attribute rule against schema bytes is not done. The caller says which rules already matched.

| Attack | Naive code | This lab | Test |
| --- | --- | --- | --- |
| Fee edit changes the buyer price | reprice the listing | listed price stays fixed | 100 before and after |
| Treat the fee as frozen at list time | ignore the edit | recompute the split | 95 becomes 90 |

---

## Masterclass — what the visualizer does not do

- It does not model author succession. That is `createauswap` / `acceptauswap` / `rejectauswap` in [wax-atomicassets-v2-action-previews](https://github.com/pixel-journey/wax-atomicassets-v2-action-previews). The window is 604800 seconds.
- It does not move `ram_payer`. That is `setrampayer` / `setlastpayer` in the same lab. The byte estimate is [wax-ram-cleanup-garbage-collection-assistant](https://github.com/pixel-journey/wax-ram-cleanup-garbage-collection-assistant).
- It does not sell. Sales and the one-asset `createbuyo` rule live in [wax-atomic-markets-and-trading-interface](https://github.com/pixel-journey/wax-atomic-markets-and-trading-interface).
- Native backing is deprecated. Collection config was never the backing switch. Do not add a "back with WAX" control. Holder splits are `equalSplit` and `duePayout` in [wax-nft-backed-token-unlock-visualizer](https://github.com/pixel-journey/wax-nft-backed-token-unlock-visualizer).

### What this course will not teach

- A broadcast, a RAM byte refund, or `is_account`
- `atomicdropsx::claimdrop` (the drops ABI was not verified)
- That a successful `previewSettlement` means the sale would succeed on chain. Ownership, the listing row, and the market contract are not checked.
