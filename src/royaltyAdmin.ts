/**
 * setroyalconf and setattrroy from atomicmarket v2.0.0.
 * is_account is not checked. A key is eosio::pack of
 * (uint8 source, string field, variant index, value) then sha256.
 * String is index 10. int8 through uint64 are indexes 0 through 7,
 * little-endian. Not checked against a node.
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

const INT_KEY = {
  int8: [0, 1],
  int16: [1, 2],
  int32: [2, 4],
  int64: [3, 8],
  uint8: [4, 1],
  uint16: [5, 2],
  uint32: [6, 4],
  uint64: [7, 8],
} as const;

export type IntKind = keyof typeof INT_KEY;

export function hashIntegerAttribute(source: number, field: string, kind: IntKind, value: bigint): string {
  const [index, width] = INT_KEY[kind];
  const bits = BigInt(width * 8);
  const masked = value & ((1n << bits) - 1n);
  const body = Buffer.alloc(width);
  if (width === 1) body.writeUInt8(Number(masked));
  else if (width === 2) body.writeUInt16LE(Number(masked));
  else if (width === 4) body.writeUInt32LE(Number(masked));
  else body.writeBigUInt64LE(masked);
  const packed = Buffer.from([source, ...packString(field), index, ...body]);
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
