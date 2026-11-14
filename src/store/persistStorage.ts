import type { PersistStorage, StorageValue } from 'zustand/middleware';
import type { Tab } from '../types';
import { canReloadFromDisk } from '../utils/fileOperations';

export const WRITE_INTERVAL_MS = 1000;

interface PersistedTabs {
  tabs: Tab[];
  activeTabId: string | null;
}

interface SafeStorage<S> extends PersistStorage<S, void> {
  flush: () => void;
}

function withTabs<S extends PersistedTabs>(state: S, tabs: Tab[]): S {
  const activeTabId = tabs.some((t) => t.id === state.activeTabId) ? state.activeTabId : tabs[tabs.length - 1]?.id ?? null;
  return { ...state, tabs, activeTabId };
}

// Smaller and smaller versions of the state; `lossy` ones lose something a reload can't bring back.
function* candidates<S extends PersistedTabs>(state: S): Generator<{ state: S; lossy: boolean }> {
  yield { state, lossy: false };

  let tabs = state.tabs.map((t): Tab => (!t.isDirty && canReloadFromDisk(t) ? { ...t, content: '', unloaded: true } : t));
  if (tabs.some((t, i) => t !== state.tabs[i])) yield { state: withTabs(state, tabs), lossy: false };

  const kept = tabs.filter((t) => t.isDirty || t.unloaded);
  if (kept.length < tabs.length) {
    tabs = kept;
    yield { state: withTabs(state, tabs), lossy: true };
  }

  const largestFirst = tabs.filter((t) => t.isDirty).sort((a, b) => b.content.length - a.content.length);
  for (const tab of largestFirst) {
    tabs = tabs.filter((t) => t !== tab);
    yield { state: withTabs(state, tabs), lossy: true };
  }
}

// localStorage that never throws into store updates, writes at most once per interval and,
// when the quota is full, keeps the largest subset of the session that still fits.
export function createSafeStorage<S extends PersistedTabs>(onLoss: () => void): SafeStorage<S> {
  let pending: { name: string; value: StorageValue<S> } | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let reported = false;

  const report = (error?: unknown) => {
    if (reported) return;
    reported = true;
    console.warn('Session storage is full; some tabs will not be restored.', error ?? '');
    onLoss();
  };

  const write = (name: string, value: StorageValue<S>) => {
    let lastError: unknown;
    for (const candidate of candidates(value.state)) {
      try {
        localStorage.setItem(name, JSON.stringify({ ...value, state: candidate.state }));
        if (candidate.lossy) report();
        return;
      } catch (error) {
        lastError = error;
      }
    }
    report(lastError);
  };

  const cancel = (name: string) => {
    if (pending?.name !== name) return;
    pending = null;
    clearTimeout(timer);
    timer = undefined;
  };

  const flush = () => {
    clearTimeout(timer);
    timer = undefined;
    if (!pending) return;
    const { name, value } = pending;
    pending = null;
    write(name, value);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
  }

  return {
    getItem: (name) => {
      // Hydrating replaces the state, so a write queued from before it is stale.
      cancel(name);
      try {
        const raw = localStorage.getItem(name);
        return raw ? (JSON.parse(raw) as StorageValue<S>) : null;
      } catch (error) {
        console.warn('Stored session could not be read.', error);
        return null;
      }
    },
    setItem: (name, value) => {
      pending = { name, value };
      timer ??= setTimeout(flush, WRITE_INTERVAL_MS);
    },
    removeItem: (name) => {
      cancel(name);
      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.warn('Stored session could not be removed.', error);
      }
    },
    flush,
  };
}
