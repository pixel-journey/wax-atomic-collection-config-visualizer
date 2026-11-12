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
