# VERIFICATION-LOG.md

**Purpose:** Honest record of tested vs. claimed behavior. See the catalog's PX-PERFECTION-STANDARD.md §7.

## Verification matrix

| Claim | Status | Evidence |
|---|---|---|
| `GET /atomicassets/v1/collections/{name}` returns author, allow_notify, authorized_accounts, notify_accounts, market_fee | untested | Smoke-test curl below |
| `market_fee` fraction string (`"0.05"`) converts to 500 bps | untested | Unit test in configInsights.test.ts |
| `market_fee` integer > 1 treated as raw bps | untested | Unit test |
| `allow_notify` absent -> undefined (not false) | untested | Unit test with partial payload |
| Empty notify_accounts -> `[]` | untested | Unit test |
| Checklist warns on fee > 1000 bps | untested | Unit test |
| Checklist warns on allowNotify false + notify list non-empty | untested | Unit test |
| UI does not imply write access | untested | Manual review of CollectionConfigSummary.tsx |
| WCAG 2.2 AA | untested | axe/Lighthouse |

## Suggested unit tests (copy into examples/configInsights.test.ts)

```ts
import { describe, it, expect } from "vitest";
import { describeMarketFee, buildImpactNotes, buildChecklist, mapCollection } from "./";
import type { CollectionConfig } from "./";

describe("describeMarketFee", () => {
  it("formats bps as percent", () => {
    expect(describeMarketFee(500)).toContain("5.00%");
  });
  it("handles missing fee", () => {
    expect(describeMarketFee(undefined)).toMatch(/not provided/i);
  });
});

describe("mapCollection fee conversion", () => {
  it("converts fraction string to bps", () => {
    const c = mapCollection({ collection_name: "x", market_fee: "0.05" });
    expect(c?.marketFeeBps).toBe(500);
  });
  it("keeps raw bps when > 1", () => {
    const c = mapCollection({ collection_name: "x", market_fee: 250 });
    expect(c?.marketFeeBps).toBe(250);
  });
  it("treats absent allow_notify as undefined", () => {
    const c = mapCollection({ collection_name: "x" });
    expect(c?.allowNotify).toBeUndefined();
  });
});

describe("buildChecklist", () => {
  it("warns on high fee", () => {
    const items = buildChecklist({ collectionName: "x", marketFeeBps: 1500 });
    expect(items.find(i => i.id === "fee-high")?.status).toBe("warn");
  });
  it("warns on allowNotify false with notify list", () => {
    const items = buildChecklist({ collectionName: "x", allowNotify: false, notifyAccounts: ["ops"] });
    expect(items.find(i => i.id === "notify-mismatch")?.status).toBe("warn");
  });
});
```

## Live smoke test

```
curl -s "https://wax.api.atomicassets.io/atomicassets/v1/collections/pixeljourney" | jq '.data | {collection_name, author, allow_notify, authorized_accounts, notify_accounts, market_fee}'
```

Diff the keys against `RawCollection` in examples/live/atomicassets.ts. If `market_fee` arrives in an unexpected format, fix `mapCollection` and this log together.

## Trust label

`educational-reference`. Not a security audit. Verify authorities and ABIs on an explorer before acting on any collection.
