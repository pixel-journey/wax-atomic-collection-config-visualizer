import { describe, expect, it } from "vitest";
import { previewCreateCollection } from "./collectionRules";

const base = {
  alreadyExists: false,
  nameIsExistingAccount: false,
  allowNotify: true,
  notifyAccounts: [] as string[],
  authorizedAccounts: ["alice"],
};

describe("collection name", () => {
  it("requires 12 characters unless the name is an account or has a suffix", () => {
    expect(previewCreateCollection({ ...base, name: "pixeljourney" })).toEqual({
      ok: true,
      action: "createcol",
      auth: "none",
    });
    expect(previewCreateCollection({ ...base, name: "short" })).toEqual({
      ok: false,
      reason: "Without special authorization, collection names must be 12 characters long",
    });
    expect(previewCreateCollection({ ...base, name: "pixeljourney", nameIsExistingAccount: true }).ok).toBe(true);
    const dotted = previewCreateCollection({ ...base, name: "art.px" });
    expect(dotted).toEqual({ ok: true, action: "createcol", auth: "suffix" });
  });

  it("refuses a taken name, notify accounts when notify is off, and a repeated authorizer", () => {
    expect(previewCreateCollection({ ...base, name: "pixeljourney", alreadyExists: true })).toEqual({
      ok: false,
      reason: "A collection with this name already exists",
    });
    expect(previewCreateCollection({
      ...base,
      name: "pixeljourney",
      allowNotify: false,
      notifyAccounts: ["ops"],
    })).toEqual({ ok: false, reason: "Can't add notify_accounts if allow_notify is false" });
    expect(previewCreateCollection({
      ...base,
      name: "pixeljourney",
      authorizedAccounts: ["alice", "alice"],
    })).toEqual({ ok: false, reason: "You can't have duplicates in the authorized_accounts" });
  });
});
