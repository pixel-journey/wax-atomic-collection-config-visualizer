/**
 * Category split from atomicmarket v2.0.0 distribute_collection_fee.
 * One asset. Attribute rules are already matched by the caller. This does
 * not read a schema. Integer division. Dust goes to the collection author.
 * A zero fee returns before the bundle check. A positive fee on more than
 * one asset is "Bundle listings retired".
 */

export type Weight = { recipient: string; weight: number };
export type MatchedRule = { weight: number; recipients: readonly Weight[] };

export type Royalty =
  | { ok: false; reason: string }
  | { ok: true; recipients: { recipient: string; amount: number }[]; authorDust: number };

function share(amount: number, weight: number, total: number): number {
  return Math.floor((amount * weight) / total);
}

export function previewRoyalty(input: {
  fee: number;
  assetCount: number;
  splitFounders: number;
  splitTemplates: number;
  splitAttributes: number;
  founders: readonly Weight[];
  templateRecipients: readonly Weight[] | null;
  matchedAttributeRules: readonly MatchedRule[];
}): Royalty {
  if (input.fee === 0) return { ok: true, recipients: [], authorDust: 0 };
  if (input.assetCount !== 1) return { ok: false, reason: "Bundle listings retired" };

  const foundersSplit = input.splitFounders > 0 && input.founders.length > 0 ? input.splitFounders : 0;
  const templatesSplit = input.templateRecipients ? input.splitTemplates : 0;
  const attributesSplit = input.matchedAttributeRules.length > 0 ? input.splitAttributes : 0;
  const totalSplit = foundersSplit + templatesSplit + attributesSplit;
  if (totalSplit === 0) return { ok: true, recipients: [], authorDust: input.fee };

  const accrued = new Map<string, number>();
  let distributed = 0;
  const pay = (recipients: readonly Weight[], amount: number) => {
    const weight = recipients.reduce((sum, pair) => sum + pair.weight, 0);
    for (const pair of recipients) {
      const payout = share(amount, pair.weight, weight);
      if (payout > 0) {
        accrued.set(pair.recipient, (accrued.get(pair.recipient) ?? 0) + payout);
        distributed += payout;
      }
    }
  };

  if (foundersSplit > 0) pay(input.founders, share(input.fee, foundersSplit, totalSplit));
  if (templatesSplit > 0 && input.templateRecipients) {
    pay(input.templateRecipients, share(input.fee, templatesSplit, totalSplit));
  }
  if (attributesSplit > 0) {
    const category = share(input.fee, attributesSplit, totalSplit);
    const ruleWeight = input.matchedAttributeRules.reduce((sum, rule) => sum + rule.weight, 0);
    for (const rule of input.matchedAttributeRules) {
      pay(rule.recipients, share(category, rule.weight, ruleWeight));
    }
  }

  return {
    ok: true,
    recipients: [...accrued.entries()].map(([recipient, amount]) => ({ recipient, amount })),
    authorDust: input.fee - distributed,
  };
}
