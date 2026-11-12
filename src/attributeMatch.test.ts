import { describe, expect, it } from "vitest";
import { previewAttributeMatches } from "./attributeMatch";

const layers = [
  { source: 1 as const, values: { rarity: "common", zeta: "z" } },
  { source: 2 as const, values: { rarity: "rare" } },
];

const rules = [
  { source: 0, field: "rarity", value: "common", weight: 1 },
  { source: 0, field: "zeta", value: "z", weight: 4 },
  { source: 1, field: "rarity", value: "common", weight: 2 },
  { source: 2, field: "rarity", value: "rare", weight: 3 },
];

describe("attribute royalty matches", () => {
  it("lets immutable data win in merged mode and looks up source 0", () => {
    expect(previewAttributeMatches({ mode: "merged", schemaEmpty: false, layers, rules }).map((rule) => rule.weight))
      .toEqual([1, 4]);
  });

  it("matches every layer in granular mode, and matches nothing on an empty schema", () => {
    expect(previewAttributeMatches({ mode: "granular", schemaEmpty: false, layers, rules }).map((rule) => rule.weight))
      .toEqual([2, 3]);
    expect(previewAttributeMatches({ mode: "merged", schemaEmpty: true, layers, rules })).toEqual([]);
  });
});
