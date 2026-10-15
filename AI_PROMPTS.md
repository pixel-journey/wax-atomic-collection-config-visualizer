# AI_PROMPTS.md — Collection Config Visualizer

## 1. Audit a collection

```
Using buildChecklist and buildImpactNotes, review this collection config JSON.
List warns first. Cite trigger fields. Do not invent Atomic fields.
```

## 2. Wire live API (read-only)

```
Add a read-only loader for AtomicAssets collection data for [NAME].
Map into CollectionConfig. Handle missing fee/notify calmly.
```

## 3. Gated update flow

```
Design a confirmation-gated WharfKit flow to update market fee / notify accounts.
Inspection UI must stay clearly separate from the mutation path.
```
