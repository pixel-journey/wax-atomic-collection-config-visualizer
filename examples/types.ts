/**
 * Educational shapes for Atomic collection configuration inspection.
 * Field availability depends on API/contract version — treat as a guide.
 */

export interface CollectionConfig {
  collectionName: string;
  author?: string;
  /** Market fee in basis points (e.g. 200 = 2%) when provided by data source */
  marketFeeBps?: number;
  allowNotify?: boolean;
  notifyAccounts?: string[];
  authorizedAccounts?: string[];
  /** Free-form notes or extra flags from API */
  extra?: Record<string, unknown>;
}

export type ChecklistStatus = "pass" | "warn" | "info";

export interface ChecklistItem {
  id: string;
  status: ChecklistStatus;
  title: string;
  detail: string;
  triggerField: string;
}

export interface ImpactNote {
  title: string;
  body: string;
  triggerField: string;
}
