// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSafeStorage, WRITE_INTERVAL_MS } from './persistStorage';
import type { Tab } from '../types';

const KEY = 'feathertype-storage';

interface State {
  tabs: Tab[];
  activeTabId: string | null;
}

const makeTab = (id: string, partial: Partial<Tab> = {}): Tab => ({
  id, title: `${id}.md`, filePath: null, content: id, isDirty: false, ...partial,
});

const value = (tabs: Tab[], activeTabId = tabs[0]?.id ?? null) => ({ state: { tabs, activeTabId }, version: 2 });

const stored = (): State => JSON.parse(localStorage.getItem(KEY)!).state;

function limitStorageTo(chars: number) {
  const real = Storage.prototype.setItem;
  return vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, v: string) {
    if (v.length > chars) throw new DOMException('quota', 'QuotaExceededError');
    real.call(this, key, v);
  });
}

let onLoss: ReturnType<typeof vi.fn<() => void>>;

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  onLoss = vi.fn<() => void>();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('throttled writes', () => {
  it('writes the latest state at most once per interval', () => {
    const storage = createSafeStorage<State>(onLoss);
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    for (let i = 0; i < 30; i++) storage.setItem(KEY, value([makeTab('a', { content: `v${i}`, isDirty: true })]));
    expect(setItem).not.toHaveBeenCalled();

    vi.advanceTimersByTime(WRITE_INTERVAL_MS);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(stored().tabs[0].content).toBe('v29');
  });

  it('writes immediately on pagehide', () => {
    const storage = createSafeStorage<State>(onLoss);
    storage.setItem(KEY, value([makeTab('a', { content: 'last words', isDirty: true })]));

    window.dispatchEvent(new Event('pagehide'));
    expect(stored().tabs[0].content).toBe('last words');
  });

  it('writes immediately when the page is hidden', () => {
    const storage = createSafeStorage<State>(onLoss);
    storage.setItem(KEY, value([makeTab('a', { content: 'tabbed away', isDirty: true })]));

    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(stored().tabs[0].content).toBe('tabbed away');
  });

  it('drops a queued write when the state is rehydrated', () => {
    const storage = createSafeStorage<State>(onLoss);
    storage.setItem(KEY, value([makeTab('stale')]));
    localStorage.setItem(KEY, JSON.stringify(value([makeTab('fresh')])));

    expect(storage.getItem(KEY)).toMatchObject({ state: { activeTabId: 'fresh' } });
    vi.advanceTimersByTime(WRITE_INTERVAL_MS);
    expect(stored().activeTabId).toBe('fresh');
  });

  it('reads a corrupt entry as no session', () => {
    localStorage.setItem(KEY, '{not json');
    expect(createSafeStorage<State>(onLoss).getItem(KEY)).toBeNull();
  });
});

describe('full quota', () => {
  it('never throws and reports the loss once', () => {
    limitStorageTo(10);
    const storage = createSafeStorage<State>(onLoss);

    for (let i = 0; i < 5; i++) {
      storage.setItem(KEY, value([makeTab('a', { content: 'x'.repeat(100), isDirty: true })]));
      expect(() => storage.flush()).not.toThrow();
    }
    expect(onLoss).toHaveBeenCalledTimes(1);
  });

  it('leaves out clean desktop text, which is re-read from disk, without reporting', () => {
    const big = makeTab('big', { filePath: 'C:/docs/big.md', content: 'x'.repeat(500) });
    const draft = makeTab('draft', { content: 'unsaved', isDirty: true });
    limitStorageTo(400);
    const storage = createSafeStorage<State>(onLoss);

    storage.setItem(KEY, value([big, draft], 'big'));
    storage.flush();

    expect(stored().tabs).toMatchObject([
      { id: 'big', filePath: 'C:/docs/big.md', content: '', unloaded: true },
      { id: 'draft', content: 'unsaved', isDirty: true },
    ]);
    expect(stored().activeTabId).toBe('big');
    expect(onLoss).not.toHaveBeenCalled();
  });

  it('keeps unsaved buffers over saved ones, dropping the largest unsaved one last', () => {
    const downloaded = makeTab('downloaded', { filePath: 'browser-save', content: 'd'.repeat(300) });
    const huge = makeTab('huge', { content: 'h'.repeat(1000), isDirty: true });
    const small = makeTab('small', { content: 'kept', isDirty: true });
    limitStorageTo(300);
    const storage = createSafeStorage<State>(onLoss);

    storage.setItem(KEY, value([downloaded, huge, small], 'huge'));
    storage.flush();

    expect(stored().tabs.map((t) => t.id)).toEqual(['small']);
    expect(stored().activeTabId).toBe('small');
    expect(onLoss).toHaveBeenCalledTimes(1);
  });
});
