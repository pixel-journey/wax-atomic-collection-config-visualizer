"use client";

import { useId, useMemo } from "react";
import { buildChecklist } from "./configInsights";
import type { ChecklistStatus, CollectionConfig } from "./types";

export interface ConfigChecklistProps {
  config: CollectionConfig;
  className?: string;
}

const statusClass: Record<ChecklistStatus, string> = {
  pass: "text-emerald-400",
  warn: "text-amber-300",
  info: "text-white/50",
};

export function ConfigChecklist({
  config,
  className = "",
}: ConfigChecklistProps) {
  const headingId = useId();
  const items = useMemo(() => buildChecklist(config), [config]);

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-black/20 p-6 ${className}`}
      aria-labelledby={headingId}
    >
      <h3 id={headingId} className="font-semibold text-lg mb-1">
        Config checklist
      </h3>
      <p className="text-sm text-white/60 mb-5">
        Heuristic review — not a substitute for official Atomic documentation.
      </p>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="text-sm border-b border-white/5 pb-3 last:border-0">
            <div className="flex justify-between gap-2">
              <span className="font-medium text-white/90">{item.title}</span>
              <span className={`text-xs uppercase tracking-wide ${statusClass[item.status]}`}>
                {item.status}
              </span>
            </div>
            <p className="text-white/60 mt-1 leading-relaxed">{item.detail}</p>
            <p className="text-xs text-white/40 mt-1">Trigger: {item.triggerField}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
