/**
 * Pure helpers for explaining and checking collection config.
 */

import type { ChecklistItem, CollectionConfig, ImpactNote } from "./types";

/** Format basis points as a percentage string */
export function describeMarketFee(bps: number | undefined): string {
  if (bps === undefined || Number.isNaN(bps)) {
    return "Market fee not provided in this dataset";
  }
  const pct = bps / 100;
  return `${bps} bps (${pct.toFixed(2)}% of applicable market sales)";
}

export function buildImpactNotes(config: CollectionConfig): ImpactNote[] {
  const notes: ImpactNote[] = [];

  if (config.marketFeeBps !== undefined) {
    notes.push({
      triggerField: "marketFeeBps",
      title: "Market fee",
      body: describeMarketFee(config.marketFeeBps),
    });
  }

  if (config.allowNotify === false) {
    notes.push({
      triggerField: "allowNotify",
      title: "Notifications disabled",
      body: "allowNotify is false — notify accounts may not receive expected Atomic notifications.",
    });
  } else if (config.allowNotify === true) {
    notes.push({
      triggerField: "allowNotify",
      title: "Notifications enabled",
      body: "allowNotify is true — ensure notifyAccounts matches your operational needs.",
    });
  }

  const notify = config.notifyAccounts ?? [];
  notes.push({
    triggerField: "notifyAccounts",
    title: "Notify accounts",
    body:
      notify.length === 0
        ? "No notify accounts listed. Ops/bots that rely on notifications will not be informed."
        : `${notify.length} account(s): ${notify.join(", ")}`,
  });

  if (config.author) {
    notes.push({
      triggerField: "author",
      title: "Author",
      body: `Collection author appears as ${config.author}. Protect this account’s keys carefully.`,
    });
  }

  return notes;
}

export function buildChecklist(config: CollectionConfig): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const notify = config.notifyAccounts ?? [];

  items.push({
    id: "fee-visible",
    status: config.marketFeeBps === undefined ? "info" : "pass",
    title: "Market fee present in dataset",
    detail: describeMarketFee(config.marketFeeBps),
    triggerField: "marketFeeBps",
  });

  if (config.marketFeeBps !== undefined && config.marketFeeBps > 1000) {
    items.push({
      id: "fee-high",
      status: "warn",
      title: "Market fee looks high",
      detail:
        "Over 10% (1000 bps) may surprise buyers on secondary markets. Confirm this is intentional.",
      triggerField: "marketFeeBps",
    });
  }

  items.push({
    id: "notify-list",
    status: notify.length === 0 ? "warn" : "pass",
    title: "Notify accounts",
    detail:
      notify.length === 0
        ? "Empty notify list — consider at least one operational account for production collections."
        : `Configured: ${notify.join(", ")}`,
    triggerField: "notifyAccounts",
  });

  if (config.allowNotify === false && notify.length > 0) {
    items.push({
      id: "notify-mismatch",
      status: "warn",
      title: "Notify accounts set but allowNotify is false",
      detail: "Listed accounts may not receive notifications until allowNotify is enabled.",
      triggerField: "allowNotify",
    });
  }

  items.push({
    id: "author",
    status: config.author ? "pass" : "info",
    title: "Author field",
    detail: config.author
      ? `Author: ${config.author}`
      : "Author not included in this dataset — load full collection data when auditing control.",
    triggerField: "author",
  });

  return items;
}
