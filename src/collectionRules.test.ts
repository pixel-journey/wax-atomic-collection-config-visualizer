import { describe, expect, it } from "vitest";
import { previewAuthorizedList, previewNotifyList, previewMarketFee, previewSettlement } from "./collectionRules";

describe("collection config rules", () => {
  it("refuses an authorized list longer than 24", () => {
    expect(previewAuthorizedList(Array(24).fill("alice"))).toEqual({ ok: true, size: 24 });
    expect(previewAuthorizedList(Array(25).fill("alice"))).toEqual({
      ok: false,
      reason: "Can only have up to 24 authorized accounts",
    });
  });

  it("refuses a notify list longer than 24", () => {
    expect(previewNotifyList(Array(24).fill("bob"))).toEqual({ ok: true, size: 24 });
    expect(previewNotifyList(Array(25).fill("bob"))).toEqual({
      ok: false,
      reason: "Can only have up to 24 notify accounts",
    });
  });

  it("refuses a market fee outside 0 to 0.15", () => {
    expect(previewMarketFee(0.05)).toEqual({ ok: true, fee: 0.05, bps: 500 });
    expect(previewMarketFee(0.15)).toEqual({ ok: true, fee: 0.15, bps: 1500 });
    expect(previewMarketFee(0.16)).toEqual({
      ok: false,
      reason: "The market_fee must be between 0 and 0.15",
    });
    expect(previewMarketFee(-0.01).ok).toBe(false);
  });

  it("keeps the buyer price fixed and moves the split when the fee changes", () => {
    const before = previewSettlement(100, 0.05);
    const after = previewSettlement(100, 0.1);
    expect(before).toEqual({ listedPrice: 100, fee: 0.05, collectionCut: 5, sellerReceives: 95 });
    expect(after).toEqual({ listedPrice: 100, fee: 0.1, collectionCut: 10, sellerReceives: 90 });
  });
});
