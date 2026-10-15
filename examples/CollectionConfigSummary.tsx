"use client";

import { useId } from "react";
import { describeMarketFee } from "./configInsights";
import type { CollectionConfig } from "./types";

export interface CollectionConfigSummaryProps {
  config: CollectionConfig;
  className?: string;
}

export function CollectionConfigSummary({
  config,
  className = "",
}: CollectionConfigSummaryProps) {
  const headingId = useId();
  const notify = config.notifyAccounts ?? [];

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-black/20 p-6 ${className}`}
      aria-labelledby={headingId}
    >
      <h3 id={headingId} className="font-semibold text-lg mb-1">
        Collection config
      </h3>
      <p className="font-mono text-emerald-400/90 text-sm mb-5">
        {config.collectionName}
      </p>

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-white/50">Author</dt>
          <dd className="font-mono text-white/90">{config.author ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/50">Market fee</dt>
          <dd className="text-right text-white/90">
            {describeMarketFee(config.marketFeeBps)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/50">Allow notify</dt>
          <dd className="text-white/90">
            {config.allowNotify === undefined
              ? "—"
              : config.allowNotify
                ? "Yes"
                : "No"}
          </dd>
        </div>
        <div>
          <dt className="text-white/50 mb-1">Notify accounts</dt>
          <dd className="text-white/90">
            {notify.length === 0 ? (
              <span className="text-white/40">None listed</span>
            ) : (
              <ul className="font-mono text-sm space-y-0.5">
                {notify.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            )}
          </dd>
        </div>
      </dl>

      <p className="text-xs text-white/40 mt-5">
        Read-only educational summary. On-chain updates require authorized
        signatures and should use a clear confirmation flow.
      </p>
    </section>
  );
}
