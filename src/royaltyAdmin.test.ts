import { describe, expect, it } from "vitest";
import { hashStringAttribute, previewSetAttributeRule, previewSetRoyaltyConfig } from "./royaltyAdmin";

const config = {
  mode: 0,
  splitFounders: 1,
  splitTemplates: 1,
  splitAttributes: 1,
  founders: [{ account: "alice", weight: 1 }],
  modeChanges: false,
  rulesExist: false,
};

describe("royalty admin", () => {
  it("refuses a mode with no category, founders on a zero split, and a mode flip that would orphan rules", () => {
    expect(previewSetRoyaltyConfig(config)).toEqual({ ok: true, action: "setroyalconf" });
    expect(previewSetRoyaltyConfig({ ...config, splitFounders: 0, splitTemplates: 0, splitAttributes: 0 }).reason)
      .toContain("At least one");
    expect(previewSetRoyaltyConfig({ ...config, splitFounders: 0 }).reason).toContain("founders must be empty");
    expect(previewSetRoyaltyConfig({ ...config, modeChanges: true, rulesExist: true }).reason)
      .toBe("attribute_mode can't be changed while attribute rules exist. Delete the rules first");
  });

  it("packs a string key and refuses a float key and a merged source that is not 0", () => {
    expect(hashStringAttribute(0, "rarity", "common")).toBe(
      "13cd53b0f99f6d0b9635589a0ce9a9218475fa5778a5fa628396ac29eea11855",
    );
    expect(previewSetAttributeRule({
      hasConfig: true, mode: 0, source: 0, field: "rarity", valueKind: "string", value: "common",
      weight: 1, recipients: [{ account: "alice", weight: 1 }],
    }).hash).toBe("13cd53b0f99f6d0b9635589a0ce9a9218475fa5778a5fa628396ac29eea11855");
    expect(previewSetAttributeRule({
      hasConfig: true, mode: 0, source: 1, field: "rarity", valueKind: "string", value: "common",
      weight: 1, recipients: [{ account: "alice", weight: 1 }],
    }).reason).toContain("source must be 0");
    expect(previewSetAttributeRule({
      hasConfig: true, mode: 0, source: 0, field: "rarity", valueKind: "float",
      weight: 1, recipients: [{ account: "alice", weight: 1 }],
    }).reason).toBe("float typed attributes can't be used as royalty match keys");
  });
});
