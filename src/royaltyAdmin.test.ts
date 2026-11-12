import { describe, expect, it } from "vitest";
import { hashIntegerAttribute, hashStringAttribute, previewSetAttributeRule, previewSetRoyaltyConfig } from "./royaltyAdmin";

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

  it("hashes uint32(5) and int32(5) to different keys", () => {
    expect(hashIntegerAttribute(0, "n", "uint32", 5n)).toBe(
      "ce1f140652bbb03d067134287227f75c3891f1da8cabcfbc245263bbe550cd72",
    );
    expect(hashIntegerAttribute(0, "n", "int32", 5n)).toBe(
      "b6284d5d8daa7952260706811dbf497c5831b8ac3f816e1b9fb0d549badc1bc2",
    );
    expect(hashIntegerAttribute(0, "n", "int8", -1n)).toBe(
      "6ab011bff06092bee17ddbeed32c3689628fb7cc8e2a47b537af0f2884cbaece",
    );
  });
});
