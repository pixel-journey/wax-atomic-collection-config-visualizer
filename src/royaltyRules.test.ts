import { describe, expect, it } from "vitest";
import { previewRoyalty } from "./royaltyRules";

const even = {
  fee: 100,
  assetCount: 1,
  splitFounders: 1,
  splitTemplates: 1,
  splitAttributes: 0,
  founders: [{ recipient: "alice", weight: 1 }, { recipient: "bob", weight: 1 }],
  templateRecipients: [{ recipient: "carol", weight: 1 }],
  matchedAttributeRules: [],
};

describe("royalty categories", () => {
  it("splits founders and a template match, and keeps the remainder for the author", () => {
    expect(previewRoyalty(even)).toEqual({
      ok: true,
      recipients: [
        { recipient: "alice", amount: 25 },
        { recipient: "bob", amount: 25 },
        { recipient: "carol", amount: 50 },
      ],
      authorDust: 0,
    });
    expect(previewRoyalty({
      ...even,
      fee: 10,
      splitTemplates: 0,
      templateRecipients: null,
      founders: [{ recipient: "alice", weight: 1 }, { recipient: "bob", weight: 2 }],
    })).toEqual({
      ok: true,
      recipients: [
        { recipient: "alice", amount: 3 },
        { recipient: "bob", amount: 6 },
      ],
      authorDust: 1,
    });
  });

  it("gives a fee with no live category to the author, and refuses a bundle", () => {
    expect(previewRoyalty({ ...even, founders: [], templateRecipients: null })).toEqual({
      ok: true, recipients: [], authorDust: 100,
    });
    expect(previewRoyalty({ ...even, fee: 0, assetCount: 2 })).toEqual({
      ok: true, recipients: [], authorDust: 0,
    });
    expect(previewRoyalty({ ...even, assetCount: 2 })).toEqual({ ok: false, reason: "Bundle listings retired" });
  });

  it("splits attribute rules by rule weight before recipient weight", () => {
    expect(previewRoyalty({
      ...even,
      fee: 100,
      splitFounders: 0,
      splitTemplates: 0,
      founders: [],
      templateRecipients: null,
      splitAttributes: 1,
      matchedAttributeRules: [
        { weight: 1, recipients: [{ recipient: "dave", weight: 1 }] },
        { weight: 1, recipients: [{ recipient: "erin", weight: 1 }] },
      ],
    })).toEqual({
      ok: true,
      recipients: [
        { recipient: "dave", amount: 50 },
        { recipient: "erin", amount: 50 },
      ],
      authorDust: 0,
    });
  });
});
