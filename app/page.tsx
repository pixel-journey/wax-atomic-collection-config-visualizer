'use client';

import React, { useCallback, useState } from 'react';
import { buildChecklist, buildImpactNotes } from '../examples/configInsights';
import { fetchCollectionConfig } from '../examples/live/atomicassets';
import type { ChecklistItem, CollectionConfig, ImpactNote } from '../examples/types';

export default function AtomicCollectionConfigVisualizer() {
  const [collection, setCollection] = useState('pixeljourney');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<CollectionConfig | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [notes, setNotes] = useState<ImpactNote[]>([]);
  const [meta, setMeta] = useState<string | null>(null);

  const runLive = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMeta(null);
    try {
      const { config: c, source } = await fetchCollectionConfig(collection);
      setConfig(c);
      setChecklist(buildChecklist(c));
      setNotes(buildImpactNotes(c));
      setMeta(source);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Live fetch failed');
      setConfig(null);
      setChecklist([]);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [collection]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-2xl tracking-widest text-emerald-400 mb-2 font-bold">
          ATOMIC COLLECTION CONFIG
        </div>
        <div className="text-xs opacity-60 mb-6">
          Pixel Journey · Live AtomicAssets collection row · Read-only
        </div>

        <div className="border border-white/10 bg-black/40 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row gap-3">
          <input
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
            className="flex-1 bg-black/60 border border-white/10 px-4 py-3 rounded-xl font-mono text-sm"
            placeholder="collection_name"
          />
          <button
            type="button"
            onClick={runLive}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-sky-600 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Fetching…' : 'Load live'}
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-400 border border-red-500/30 rounded-xl p-3">
            {error}
          </div>
        )}
        {meta && (
          <div className="mb-4 text-xs opacity-50 break-all">{meta}</div>
        )}

        {config && (
          <div className="border border-white/10 bg-black/40 rounded-2xl p-6 mb-6">
            <div className="font-mono text-xl text-emerald-400 mb-2">
              {config.collectionName}
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-white/50 text-xs">Author</dt>
                <dd className="font-mono">{config.author || '—'}</dd>
              </div>
              <div>
                <dt className="text-white/50 text-xs">Market fee (bps)</dt>
                <dd className="font-mono">
                  {config.marketFeeBps ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-white/50 text-xs">allowNotify</dt>
                <dd className="font-mono">{String(config.allowNotify)}</dd>
              </div>
              <div>
                <dt className="text-white/50 text-xs">Notify accounts</dt>
                <dd className="font-mono text-xs break-all">
                  {(config.notifyAccounts || []).join(', ') || '—'}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {checklist.length > 0 && (
          <ul className="space-y-2 mb-6 text-sm">
            {checklist.map((item) => (
              <li
                key={item.id}
                className={`rounded-xl border p-3 ${
                  item.status === 'warn'
                    ? 'border-amber-500/30 bg-amber-500/10'
                    : item.status === 'pass'
                      ? 'border-emerald-500/20 bg-emerald-500/5'
                      : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="font-medium">
                  [{item.status}] {item.title}
                </div>
                <div className="text-xs opacity-70 mt-1">{item.detail}</div>
              </li>
            ))}
          </ul>
        )}

        {notes.length > 0 && (
          <div className="space-y-2 text-xs opacity-80">
            {notes.map((n) => (
              <div key={n.triggerField + n.title}>
                <strong className="text-white/90">{n.title}:</strong> {n.body}
              </div>
            ))}
          </div>
        )}

        {!config && !loading && !error && (
          <p className="text-sm opacity-50">
            Load a collection to inspect author, market fee, and notify settings.
          </p>
        )}

        <p className="mt-8 text-xs opacity-60">
          Same AtomicAssets endpoints AtomicHub relies on. Checklist is educational —
          not a security audit.
        </p>
      </div>
    </div>
  );
}
