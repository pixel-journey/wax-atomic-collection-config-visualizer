"use client";

import { useId, useMemo } from "react";
import { buildImpactNotes } from "./configInsights";
import type { CollectionConfig } from "./types";

export interface ImpactPanelProps {
  config: CollectionConfig;
  className?: string;
}

export function ImpactPanel({ config, className = "" }: ImpactPanelProps) {
  const headingId = useId();
  const notes = useMemo(() => buildImpactNotes(config), [config]);

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-black/20 p-6 ${className}`}
      aria-labelledby={headingId}
    >
      <h3 id={headingId} className="font-semibold text-lg mb-1">
        Impact notes
      </h3>
      <p className="text-sm text-white/60 mb-5">
        Plain-language interpretation of the current config values.
      </p>

      <ul className="space-y-4">
        {notes.map((n) => (
          <li key={n.triggerField + n.title} className="text-sm">
            <p className="font-medium text-white/90">{n.title}</p>
            <p className="text-white/60 mt-0.5 leading-relaxed">{n.body}</p>
            <p className="text-xs text-white/40 mt-1">Field: {n.triggerField}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
