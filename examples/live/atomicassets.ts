/**
 * Live AtomicAssets collection → CollectionConfig.
 * Public indexer data (AtomicHub / guild Atomic APIs).
 */

import type { CollectionConfig } from "../types";

export const DEFAULT_ATOMIC = "https://wax.api.atomicassets.io";

interface RawCollection {
  collection_name?: string;
  author?: string;
  allow_notify?: boolean;
  authorized_accounts?: string[];
  notify_accounts?: string[];
  market_fee?: string | number;
  data?: Record<string, unknown>;
}

export function mapCollection(raw: RawCollection): CollectionConfig | null {
  if (!raw.collection_name) return null;
  // market_fee on Atomic is often a fraction string e.g. "0.05" = 5%
  let marketFeeBps: number | undefined;
  if (raw.market_fee != null && raw.market_fee !== "") {
    const fee = Number(raw.market_fee);
    if (Number.isFinite(fee)) {
      // if already looks like bps (>1), keep; else convert fraction → bps
      marketFeeBps = fee > 1 ? Math.round(fee) : Math.round(fee * 10000);
    }
  }
  return {
    collectionName: raw.collection_name,
    author: raw.author,
    marketFeeBps,
    allowNotify: raw.allow_notify,
    notifyAccounts: raw.notify_accounts ?? [],
    authorizedAccounts: raw.authorized_accounts ?? [],
    extra: raw.data,
  };
}

export async function fetchCollectionConfig(
  collection: string,
  options: { atomicBase?: string; signal?: AbortSignal } = {}
): Promise<{ config: CollectionConfig; source: string }> {
  const base = (options.atomicBase || DEFAULT_ATOMIC).replace(/\/$/, "");
  const name = collection.trim().toLowerCase();
  if (!name) throw new Error("Collection required");

  const url = `${base}/atomicassets/v1/collections/${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    signal: options.signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`AtomicAssets ${res.status}: ${res.statusText}`);
  const json = await res.json();
  const raw: RawCollection = json.data ?? json;
  const config = mapCollection(raw);
  if (!config) throw new Error("Unexpected collection response");
  return { config, source: url };
}
