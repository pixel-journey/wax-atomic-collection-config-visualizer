/**
 * setroyalconf and setattrroy from atomicmarket v2.0.0.
 * is_account is not checked. The hash is eosio::pack of
 * (uint8 source, string field, variant index 10, string value) then sha256.
 * Index 10 is std::string in atomicdata::ATOMIC_ATTRIBUTE. Other types are
 * not packed. Not checked against a node.
 */
import { createHash } from "node:crypto";

export type Recipient = { account: string; weight: number };

function varuint(value: number): number[] {
  const bytes: number[] = [];
  let rest = value;
  while (rest >= 0x80) {
    bytes.push((rest & 0x7f) | 0x80);
    rest >>= 7;
  }
  bytes.push(rest);
  return bytes;
}

function packString(value: string): number[] {
  const bytes = [...Buffer.from(value, "utf8")];
  return [...varuint(bytes.length), ...bytes];
}

export function hashStringAttribute(source: number, field: string, value: string): string {
  const packed = Buffer.from([source, ...packString(field), 10, ...packString(value)]);
  return createHash("sha256").update(packed).digest("hex");
}

export function previewSetRoyaltyConfig(input: {
  mode: number;
  splitFounders: number;
  splitTemplates: number;
  splitAttributes: number;
  founders: readonly Recipient[];
  modeChanges: boolean;
  rulesExist: boolean;
}): { ok: false; reason: string } | { ok: true; action: "setroyalconf" } {
  if (input.mode > 1) return { ok: false, reason: "attribute_mode must be 0 (merged) or 1 (granular per-source)" };
  if (input.splitFounders <= 0 && input.splitTemplates <= 0 && input.splitAttributes <= 0) {
    return { ok: false, reason: "At least one of the category split weights must be greater than 0" };
  }
  if (input.splitFounders > 0 && input.founders.length === 0) {
    return { ok: false, reason: "The recipients list must not be empty" };
  }
  if (input.splitFounders <= 0 && input.founders.length > 0) {
    return { ok: false, reason: "founders must be empty when split_founders is 0" };
  }
  if (input.modeChanges && input.rulesExist) {
    return { ok: false, reason: "attribute_mode can't be changed while attribute rules exist. Delete the rules first" };
  }
  return { ok: true, action: "setroyalconf" };
}

export function previewSetAttributeRule(input: {
  hasConfig: boolean;
  mode: 0 | 1;
  source: number;
  field: string;
  valueKind: "string" | "float" | "double" | "vector" | "other";
  value?: string;
  weight: number;
  recipients: readonly Recipient[];
}): { ok: false; reason: string } | { ok: true; action: "setattrroy"; hash?: string } {
  if (!input.hasConfig) {
    return { ok: false, reason: "No royalty config exists for this collection. Create one using the setroyalconf action first" };
  }
  if (input.mode === 0 && input.source !== 0) {
    return { ok: false, reason: "This collection uses the merged attribute mode, the source must be 0" };
  }
  if (input.mode === 1 && (input.source < 1 || input.source > 4)) {
    return {
      ok: false,
      reason: "This collection uses the granular attribute mode, the source must be 1 (asset immutable), 2 (asset mutable), 3 (template immutable) or 4 (template mutable)",
    };
  }
  if (input.field.length === 0) return { ok: false, reason: "field must not be empty" };
  if (input.field.length > 64) return { ok: false, reason: "field can only be 64 characters max" };
  if (input.valueKind === "float" || input.valueKind === "double") {
    return { ok: false, reason: "float typed attributes can't be used as royalty match keys" };
  }
  if (input.valueKind === "vector") return { ok: false, reason: "vector typed attributes can't be used as royalty match keys" };
  if (input.weight <= 0) return { ok: false, reason: "rule_weight must be greater than 0" };
  if (input.recipients.length === 0) return { ok: false, reason: "The recipients list must not be empty" };
  if (input.recipients.length > 64) return { ok: false, reason: "The recipients list can hold 64 entries max" };
  const seen = new Set<string>();
  for (const recipient of input.recipients) {
    if (recipient.weight <= 0) return { ok: false, reason: "Recipient weights must be greater than 0" };
    if (seen.has(recipient.account)) return { ok: false, reason: "The recipients list must not contain duplicates" };
    seen.add(recipient.account);
  }
  if (input.valueKind === "string" && input.value !== undefined) {
    return { ok: true, action: "setattrroy", hash: hashStringAttribute(input.source, input.field, input.value) };
  }
  return { ok: true, action: "setattrroy" };
}
