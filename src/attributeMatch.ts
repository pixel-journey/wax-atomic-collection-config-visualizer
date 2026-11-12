/**
 * Which attribute royalty rules match, from atomicmarket v2.0.0
 * distribute_collection_fee. The contract hashes (source, field, value).
 * This compares those three. It does not compute checksum256 and it does
 * not deserialize bytes. Values are the strings you pass.
 *
 * Source ids: 1 asset immutable, 2 asset mutable, 3 template immutable,
 * 4 template mutable. Higher first. Merged mode (attribute_mode 0) keeps
 * the first value for a field and looks up source 0. Granular mode looks
 * up each layer's own source id. An empty schema matches nothing.
 * Fields are visited in alphabetical order, matching std::map.
 */

export type Layer = { source: 1 | 2 | 3 | 4; values: Readonly<Record<string, string>> };

export type AttributeRule = {
  source: number;
  field: string;
  value: string;
  weight: number;
};

export function previewAttributeMatches(input: {
  mode: "merged" | "granular";
  schemaEmpty: boolean;
  layers: readonly Layer[];
  rules: readonly AttributeRule[];
}): AttributeRule[] {
  if (input.schemaEmpty) return [];
  const layers = [...input.layers].filter((layer) => Object.keys(layer.values).length > 0)
    .sort((left, right) => left.source - right.source);
  const matched: AttributeRule[] = [];
  const find = (source: number, field: string, value: string) =>
    input.rules.find((rule) => rule.source === source && rule.field === field && rule.value === value);

  if (input.mode === "merged") {
    const merged = new Map<string, string>();
    for (const layer of layers) {
      for (const [field, value] of Object.entries(layer.values)) {
        if (!merged.has(field)) merged.set(field, value);
      }
    }
    for (const field of [...merged.keys()].sort()) {
      const rule = find(0, field, merged.get(field) ?? "");
      if (rule) matched.push(rule);
    }
    return matched;
  }

  for (const layer of layers) {
    for (const field of Object.keys(layer.values).sort()) {
      const rule = find(layer.source, field, layer.values[field] ?? "");
      if (rule) matched.push(rule);
    }
  }
  return matched;
}
