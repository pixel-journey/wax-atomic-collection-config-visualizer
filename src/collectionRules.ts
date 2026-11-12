/**
 * Collection config rules from atomicassets-contract tag v2.0.0.
 * Source: src/atomicassets.cpp (createcol, addcolauth, addnotifyacc) and
 * include/atomicassets.hpp (MAX_MARKET_FEE = 0.15). Not compiled. Not executed.
 *
 * Official reading:
 * - Contract: https://github.com/atomicassets/atomicassets-contract/tree/v2.0.0
 * - WAX docs: https://docs.wax.io/build/tutorials/howto_atomicassets/collection_js
 * - AtomicAssets overview: https://docs.wax.io/build/tutorials/howto_atomicassets
 */

export type ListResult =
  | { ok: false; reason: string }
  | { ok: true; size: number };

/** addcolauth / createcol refuse lists longer than 24. Older rows above the cap can still remove. */
export function previewAuthorizedList(accounts: readonly string[]): ListResult {
  if (accounts.length > 24) {
    return { ok: false, reason: "Can only have up to 24 authorized accounts" };
  }
  return { ok: true, size: accounts.length };
}

/** addnotifyacc / createcol refuse lists longer than 24. */
export function previewNotifyList(accounts: readonly string[]): ListResult {
  if (accounts.length > 24) {
    return { ok: false, reason: "Can only have up to 24 notify accounts" };
  }
  return { ok: true, size: accounts.length };
}

export const MAX_MARKET_FEE = 0.15;

export type FeeResult =
  | { ok: false; reason: string }
  | { ok: true; fee: number; bps: number };

/** market_fee must be in [0, 0.15]. */
export function previewMarketFee(fee: number): FeeResult {
  if (!(fee >= 0 && fee <= MAX_MARKET_FEE)) {
    return { ok: false, reason: "The market_fee must be between 0 and 0.15" };
  }
  return { ok: true, fee, bps: Math.round(fee * 10_000) };
}

/**
 * AtomicMarket v2 reads market_fee live at settlement.
 * The buyer still pays the listed price. The split between seller and collection moves.
 * This is not a sale action. It only shows the arithmetic.
 */
export type Settlement = {
  listedPrice: number;
  fee: number;
  collectionCut: number;
  sellerReceives: number;
};

export function previewSettlement(listedPrice: number, fee: number): Settlement | { ok: false; reason: string } {
  const checked = previewMarketFee(fee);
  if (!checked.ok) return checked;
  if (listedPrice < 0) return { ok: false, reason: "listed price must be non-negative" };
  const collectionCut = listedPrice * fee;
  return {
    listedPrice,
    fee,
    collectionCut,
    sellerReceives: listedPrice - collectionCut,
  };
}

/**
 * createcol name and notify rules. is_account and has_auth are not simulated.
 * A dotted name or a name that is already an account is marked as needing that
 * authorization. This function does not grant it.
 * Length is JavaScript string length.
 */
export type CollectionShape =
  | { ok: false; reason: string }
  | { ok: true; action: "createcol"; auth: "none" | "existing-account" | "suffix" };

export function previewCreateCollection(input: {
  name: string;
  alreadyExists: boolean;
  nameIsExistingAccount: boolean;
  allowNotify: boolean;
  notifyAccounts: readonly string[];
  authorizedAccounts: readonly string[];
}): CollectionShape {
  let auth: "none" | "existing-account" | "suffix" = "none";
  if (input.nameIsExistingAccount) {
    auth = "existing-account";
  } else if (input.name.includes(".")) {
    auth = "suffix";
  } else if (input.name.length !== 12) {
    return { ok: false, reason: "Without special authorization, collection names must be 12 characters long" };
  }
  if (input.alreadyExists) return { ok: false, reason: "A collection with this name already exists" };
  if (!input.allowNotify && input.notifyAccounts.length > 0) {
    return { ok: false, reason: "Can't add notify_accounts if allow_notify is false" };
  }
  const seen = new Set<string>();
  for (const account of input.authorizedAccounts) {
    if (seen.has(account)) return { ok: false, reason: "You can't have duplicates in the authorized_accounts" };
    seen.add(account);
  }
  return { ok: true, action: "createcol", auth };
}

/**
 * internal_payout_sale from atomicassets/atomicmarket-contract tag v2.0.0.
 * Cuts are (uint64_t)(fee * amount), which truncates. Maker, then taker,
 * then the live collection fee, then bonus fees whose counter matches and
 * whose id is in [start, end). The seller remainder must be greater than 0.
 * A royalty config changes who receives the collection cut. It does not
 * change the seller remainder. That recipient walk is not done here.
 * Marketplace rows are assumed to exist. No balance is written.
 */
export type BonusFee = { fee: number; counter: string; startId: number; endId: number };

export type Payout =
  | { ok: false; reason: string }
  | {
      ok: true;
      makerCut: number;
      takerCut: number;
      collectionCut: number;
      bonusCuts: number[];
      sellerReceives: number;
      collectionRecipient: "author" | "royalty-table";
    };

export function previewPayout(input: {
  amount: number;
  makerFee: number;
  takerFee: number;
  collectionFee: number;
  assetCount: number;
  hasRoyaltyConfig: boolean;
  counter: string;
  counterId: number;
  bonusFees: readonly BonusFee[];
}): Payout {
  if (!(input.collectionFee >= 0 && input.collectionFee <= 0.15)) {
    return { ok: false, reason: "The collection fee at execution time is outside the valid range" };
  }
  const cut = (fee: number) => Math.trunc(fee * input.amount);
  const makerCut = cut(input.makerFee);
  const takerCut = cut(input.takerFee);
  const collectionCut = cut(input.collectionFee);
  const bonusCuts: number[] = [];
  let spent = makerCut + takerCut + collectionCut;
  for (const bonus of input.bonusFees) {
    if (bonus.counter !== input.counter) continue;
    if (input.counterId < bonus.startId || input.counterId >= bonus.endId) continue;
    const bonusCut = cut(bonus.fee);
    bonusCuts.push(bonusCut);
    spent += bonusCut;
  }
  const sellerReceives = input.amount - spent;
  if (sellerReceives <= 0) return { ok: false, reason: "Total fees leave no payout for the seller" };
  const collectionRecipient = input.assetCount > 1 || !input.hasRoyaltyConfig ? "author" : "royalty-table";
  return { ok: true, makerCut, takerCut, collectionCut, bonusCuts, sellerReceives, collectionRecipient };
}


