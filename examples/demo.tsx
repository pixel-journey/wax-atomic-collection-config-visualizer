"use client";

import { CollectionConfigSummary } from "./CollectionConfigSummary";
import { ImpactPanel } from "./ImpactPanel";
import { ConfigChecklist } from "./ConfigChecklist";
import type { CollectionConfig } from "./types";

const DEMO_CONFIG: CollectionConfig = {
  collectionName: "demo.collection",
  author: "creator.wam",
  marketFeeBps: 200,
  allowNotify: true,
  notifyAccounts: ["ops.wam", "bots.wam"],
  authorizedAccounts: ["creator.wam"],
};

export default function CollectionConfigDemo() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-emerald-400/80">
          Pixel Journey · Atomic Ecosystem
        </p>
        <h1 className="text-2xl font-bold text-white">
          Collection Config Visualizer Demo
        </h1>
        <p className="text-sm text-white/60 max-w-2xl">
          Fixture data for education. Load live AtomicAssets collection data in
          production integrations.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <CollectionConfigSummary config={DEMO_CONFIG} />
        <ImpactPanel config={DEMO_CONFIG} />
      </div>

      <ConfigChecklist config={DEMO_CONFIG} />
    </div>
  );
}
