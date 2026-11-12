import { describe, expect, it } from "vitest";
import { previewAuthorizedList, previewNotifyList, previewMarketFee, previewSettlement, previewPayout } from "./collectionRules";

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

  it("truncates each market cut and refuses a seller remainder of zero", () => {
    expect(previewPayout({
      amount: 10000,
      makerFee: 0.01,
      takerFee: 0.01,
      collectionFee: 0.05,
      assetCount: 1,
      hasRoyaltyConfig: false,
      counter: "auction",
      counterId: 7,
      bonusFees: [{ fee: 0.01, counter: "auction", startId: 1, endId: 10 }],
    })).toEqual({
      ok: true,
      makerCut: 100,
      takerCut: 100,
      collectionCut: 500,
      bonusCuts: [100],
      sellerReceives: 9200,
      collectionRecipient: "author",
    });
    expect(previewPayout({
      amount: 3, makerFee: 0.01, takerFee: 0, collectionFee: 0, assetCount: 1,
      hasRoyaltyConfig: true, counter: "sale", counterId: 1, bonusFees: [],
    })).toMatchObject({ makerCut: 0, sellerReceives: 3, collectionRecipient: "royalty-table" });
    const drained = previewPayout({
      amount: 100, makerFee: 0.6, takerFee: 0.3, collectionFee: 0.15, assetCount: 1,
      hasRoyaltyConfig: false, counter: "sale", counterId: 1, bonusFees: [],
    });
    expect(drained).toEqual({ ok: false, reason: "Total fees leave no payout for the seller" });
  });
});
