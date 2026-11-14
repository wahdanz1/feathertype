// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const invoke = vi.hoisted(() => vi.fn());
const save = vi.hoisted(() => vi.fn());
const open = vi.hoisted(() => vi.fn());
vi.mock('@tauri-apps/api/core', () => ({ invoke }));
vi.mock('@tauri-apps/plugin-dialog', () => ({ save, open }));
vi.mock('../utils/docx', () => ({ markdownToDocxBuffer: async () => new ArrayBuffer(4) }));
vi.mock('mammoth', () => ({ default: { convertToMarkdown: async () => ({ value: '# Report' }) } }));

import { flushPersistedState, STORAGE_FULL_NOTICE, useEditorStore } from './useEditorStore';
import { WRITE_INTERVAL_MS } from './persistStorage';
import { exportAsDocx, handleSaveAsFile, handleSaveFile, hashContent, openFile } from '../utils/fileOperations';
import type { Tab } from '../types';

const STORAGE_KEY = 'feathertype-storage';
const s = () => useEditorStore.getState();
const tab = () => s().tabs.find((t) => t.id === 'a');

let downloads: string[];
let downloadTypes: string[];
let alertSpy: ReturnType<typeof vi.spyOn>;
let promptSpy: ReturnType<typeof vi.spyOn>;

function seed(partial: Partial<Tab> = {}) {
  const t: Tab = { id: 'a', title: 'Untitled', filePath: null, content: 'draft', isDirty: true, ...partial };
  useEditorStore.setState({ tabs: [t], activeTabId: 'a', unsavedChangesDialog: { isOpen: false, tabId: null } });
}

function setDesktop(on: boolean) {
  if (on) window.__TAURI_INTERNALS__ = {};
  else delete window.__TAURI_INTERNALS__;
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => { resolve = r; });
  return { promise, resolve };
}

const saveActive = () => handleSaveFile(tab()!, s().markTabClean, s().updateTabPath);

beforeEach(() => {
  flushPersistedState();
  localStorage.clear();
  useEditorStore.setState({ notices: [] });
  setDesktop(false);
  invoke.mockReset();
  save.mockReset();
  open.mockReset();
  downloads = [];
  downloadTypes = [];
  URL.createObjectURL = vi.fn((blob: Blob) => { downloadTypes.push(blob.type); return 'blob:test'; });
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    downloads.push(this.download);
  });
  alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('save and close', () => {
  it('keeps the tab when the web name prompt is cancelled', async () => {
    seed();
    s().closeTab('a');
    await s().saveAndCloseTab();

    expect(tab()?.content).toBe('draft');
    expect(s().unsavedChangesDialog).toEqual({ isOpen: true, tabId: 'a' });
    expect(downloads).toEqual([]);
  });

  it('keeps the tab when the desktop save dialog is cancelled', async () => {
    setDesktop(true);
    seed();
    save.mockResolvedValue(null);
    s().closeTab('a');
    await s().saveAndCloseTab();

    expect(tab()?.content).toBe('draft');
    expect(invoke).not.toHaveBeenCalled();
  });

  it('keeps the tab, alerts once and resolves when the write fails', async () => {
    setDesktop(true);
    seed({ title: 'notes.md', filePath: 'C:/docs/notes.md' });
    invoke.mockRejectedValue('disk full');
    s().closeTab('a');

    await expect(s().saveAndCloseTab()).resolves.toBeUndefined();
    expect(tab()?.isDirty).toBe(true);
    expect(alertSpy).toHaveBeenCalledTimes(1);

    s().confirmCloseTab();
    expect(tab()).toBeUndefined();
  });

  it('closes the tab once the save completed', async () => {
    promptSpy.mockReturnValue('notes');
    seed();
    s().closeTab('a');
    await s().saveAndCloseTab();

    expect(downloads).toEqual(['notes.md']);
    expect(tab()).toBeUndefined();
    expect(s().unsavedChangesDialog.isOpen).toBe(false);
  });
});

describe('save in flight', () => {
  it('stays dirty when the content changed during the write', async () => {
    setDesktop(true);
    seed({ title: 'notes.md', filePath: 'C:/docs/notes.md' });
    const write = deferred();
    invoke.mockReturnValue(write.promise);

    const saving = saveActive();
    s().updateTabContent('a', 'draft and more');
    write.resolve();

    await saving;
    expect(tab()).toMatchObject({ content: 'draft and more', isDirty: true });
  });

  it('turns clean when nothing changed during the write', async () => {
    setDesktop(true);
    seed({ title: 'notes.md', filePath: 'C:/docs/notes.md' });
    invoke.mockResolvedValue(undefined);

    await saveActive();
    expect(tab()?.isDirty).toBe(false);
  });
});

describe('web-opened files across reloads', () => {
  it('opens a File without keeping it in persisted state', async () => {
    const file = new File(['# hi'], 'notes.md', { type: 'text/markdown' });
    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (this: HTMLInputElement) {
      Object.defineProperty(this, 'files', { value: [file] });
      this.onchange?.({ target: this } as unknown as Event);
    });

    const opened = await openFile();
    expect(opened).toEqual({ filePath: 'browser-save', title: 'notes.md', content: '# hi' });

    s().addTab({ ...opened!, isDirty: false });
    flushPersistedState();
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(persisted.state.tabs.at(-1)).toMatchObject({ filePath: 'browser-save', title: 'notes.md' });
  });

  it('migrates a File persisted as {} so save and export still work', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      state: { tabs: [{ id: 'a', title: 'notes.md', filePath: {}, content: 'draft', isDirty: true }], activeTabId: 'a' },
      version: 0,
    }));
    await useEditorStore.persist.rehydrate();

    expect(tab()).toMatchObject({ filePath: 'browser-save', title: 'notes.md' });

    await expect(saveActive()).resolves.toBe(true);
    await exportAsDocx(tab()!);

    expect(downloads).toEqual(['notes.md', 'notes.docx']);
    expect(promptSpy).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(tab()?.isDirty).toBe(false);
  });
});

describe('imported Word files', () => {
  const writes = (cmd: string) => invoke.mock.calls.filter(([c]) => c === cmd).map(([, args]) => args.path);

  async function importDesktopDocx() {
    setDesktop(true);
    open.mockResolvedValue('C:/docs/report.docx');
    invoke.mockImplementation(async (cmd: string) => (cmd === 'read_file_binary' ? [0] : undefined));
    const opened = await openFile();
    useEditorStore.setState({ tabs: [{ id: 'a', isDirty: false, ...opened! }], activeTabId: 'a' });
  }

  it('saves a desktop import through the dialog with a .md beside the original', async () => {
    await importDesktopDocx();
    save.mockResolvedValue(null);
    await saveActive();
    expect(writes('write_file_binary')).toEqual([]);
    expect(tab()).toMatchObject({ filePath: null, title: 'report.md' });
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ defaultPath: 'C:/docs/report.md' }));

    save.mockResolvedValue('C:/docs/report.md');
    await expect(saveActive()).resolves.toBe(true);
    expect(writes('write_file')).toEqual(['C:/docs/report.md']);
    expect(writes('write_file_binary')).toEqual([]);
    expect(tab()).toMatchObject({ filePath: 'C:/docs/report.md', title: 'report.md' });
    expect(tab()?.suggestedPath).toBeUndefined();
  });

  it('still writes a real DOCX when Save As picks a .docx path', async () => {
    await importDesktopDocx();
    save.mockResolvedValue('C:/docs/report.docx');

    await expect(handleSaveAsFile(tab()!, s().markTabClean, s().updateTabPath)).resolves.toBe(true);
    expect(writes('write_file_binary')).toEqual(['C:/docs/report.docx']);
    expect(writes('write_file')).toEqual([]);
  });

  it('prompts a web import for a name prefilled with .md and downloads Markdown', async () => {
    const file = new File(['PK'], 'report.docx');
    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (this: HTMLInputElement) {
      Object.defineProperty(this, 'files', { value: [file] });
      this.onchange?.({ target: this } as unknown as Event);
    });
    const opened = await openFile();
    useEditorStore.setState({ tabs: [{ id: 'a', isDirty: false, ...opened! }], activeTabId: 'a' });
    promptSpy.mockImplementation((_message?: string, value?: string) => value ?? null);

    await expect(saveActive()).resolves.toBe(true);
    expect(promptSpy).toHaveBeenCalledWith('File name:', 'report.md');
    expect(downloads).toEqual(['report.md']);
    expect(downloadTypes).toEqual(['text/markdown']);
  });

  it('migrates a persisted tab that still targets a .docx', async () => {
    setDesktop(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      state: { tabs: [{ id: 'a', title: 'report.docx', filePath: 'C:/docs/report.docx', content: 'draft', isDirty: true }], activeTabId: 'a' },
      version: 1,
    }));
    await useEditorStore.persist.rehydrate();
    expect(tab()).toMatchObject({ filePath: null, title: 'report.md', suggestedPath: 'C:/docs/report.md' });

    save.mockResolvedValue(null);
    await saveActive();
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ defaultPath: 'C:/docs/report.md' }));
    expect(invoke).not.toHaveBeenCalled();
  });
});

function limitStorageTo(chars: number) {
  const real = Storage.prototype.setItem;
  return vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, v: string) {
    if (v.length > chars) throw new DOMException('quota', 'QuotaExceededError');
    real.call(this, key, v);
  });
}

const persistedTabs = (): Tab[] => JSON.parse(localStorage.getItem(STORAGE_KEY)!).state.tabs;

describe('persistence', () => {
  it('writes at most once per interval while typing', () => {
    vi.useFakeTimers();
    seed();
    flushPersistedState();
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    for (let i = 0; i < 30; i++) s().updateTabContent('a', `draft ${i}`);
    vi.advanceTimersByTime(WRITE_INTERVAL_MS);

    expect(setItem).toHaveBeenCalledTimes(1);
    expect(persistedTabs()[0].content).toBe('draft 29');
  });

  it('keeps the last edits when the page is hidden or reloaded', () => {
    vi.useFakeTimers();
    seed();
    s().updateTabContent('a', 'typed just before reload');

    window.dispatchEvent(new Event('pagehide'));
    expect(persistedTabs()[0].content).toBe('typed just before reload');
  });

  it('keeps editing and saving under a full quota and tells the user once', async () => {
    seed({ title: 'notes.md', filePath: 'browser-save' });
    useEditorStore.setState({ tabs: [...s().tabs, { id: 'b', title: 'small', filePath: null, content: '', isDirty: true }] });
    flushPersistedState();
    limitStorageTo(400);
    const huge = 'x'.repeat(1000);

    for (let i = 0; i < 5; i++) {
      expect(() => s().updateTabContent('a', huge + i)).not.toThrow();
      flushPersistedState();
    }
    s().updateTabContent('b', 'fits');

    await expect(saveActive()).resolves.toBe(true);
    expect(tab()?.isDirty).toBe(false);
    expect(alertSpy).not.toHaveBeenCalled();
    expect(s().notices.filter((n) => n === STORAGE_FULL_NOTICE)).toHaveLength(1);

    flushPersistedState();
    expect(persistedTabs()).toMatchObject([{ id: 'b', content: 'fits' }]);
  });
});

describe('desktop tabs on startup', () => {
  const PATH = 'C:/docs/notes.md';

  function onDisk(files: Record<string, string>) {
    invoke.mockImplementation(async (cmd: string, args: { path: string; content?: string }) => {
      if (cmd === 'write_file') {
        files[args.path] = args.content!;
        return;
      }
      if (cmd !== 'read_file') return;
      if (!(args.path in files)) throw 'Failed to read file: not found';
      return files[args.path];
    });
  }

  async function restore(tabs: Tab[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { tabs, activeTabId: tabs[0].id }, version: 2 }));
    await useEditorStore.persist.rehydrate();
    await s().syncTabsWithDisk();
  }

  beforeEach(() => setDesktop(true));

  it('reloads clean tabs from disk', async () => {
    onDisk({ [PATH]: 'edited elsewhere' });
    await restore([{ id: 'a', title: 'notes.md', filePath: PATH, content: 'old', isDirty: false, diskHash: hashContent('old') }]);

    expect(tab()).toMatchObject({ content: 'edited elsewhere', isDirty: false, diskHash: hashContent('edited elsewhere') });
    expect(s().notices).toEqual([]);
  });

  it('keeps a dirty buffer and flags it when its file changed since it was opened', async () => {
    const files = { [PATH]: 'v1' };
    onDisk(files);
    open.mockResolvedValue(PATH);
    const opened = await openFile();
    useEditorStore.setState({ tabs: [{ id: 'a', isDirty: false, ...opened! }], activeTabId: 'a' });
    s().updateTabContent('a', 'v1 plus my edits');
    files[PATH] = 'v2 from another app';

    await restore([tab()!]);

    expect(tab()).toMatchObject({ content: 'v1 plus my edits', isDirty: true });
    expect(s().notices).toHaveLength(1);
    expect(s().notices[0]).toContain('"notes.md" changed on disk');
  });

  it('flags a dirty buffer whose file changed after an in-app save', async () => {
    const files: Record<string, string> = {};
    onDisk(files);
    seed({ title: 'notes.md', filePath: PATH, content: 'saved', isDirty: true });
    await saveActive();
    s().updateTabContent('a', 'saved and edited');
    files[PATH] = 'changed elsewhere';

    await restore([tab()!]);
    expect(tab()).toMatchObject({ content: 'saved and edited', isDirty: true });
    expect(s().notices[0]).toContain('changed on disk');
  });

  it('leaves a dirty buffer alone when its file is unchanged', async () => {
    onDisk({ [PATH]: 'v1' });
    await restore([{ id: 'a', title: 'notes.md', filePath: PATH, content: 'v1 edited', isDirty: true, diskHash: hashContent('v1') }]);

    expect(tab()).toMatchObject({ content: 'v1 edited', isDirty: true });
    expect(s().notices).toEqual([]);
  });

  it('keeps the buffer as unsaved when the file is gone', async () => {
    onDisk({});
    const gone = { id: 'a', title: 'notes.md', filePath: PATH, content: 'kept', isDirty: false, diskHash: hashContent('kept') };
    await expect(restore([gone])).resolves.toBeUndefined();

    expect(tab()).toMatchObject({ content: 'kept', isDirty: true, filePath: PATH });
    expect(s().notices[0]).toContain('Couldn\'t read "notes.md"');
  });

  it('restores text left out of a full storage from disk', async () => {
    const text = 'y'.repeat(1000);
    onDisk({ [PATH]: text });
    seed({ title: 'notes.md', filePath: PATH, content: text, isDirty: false, diskHash: hashContent(text) });
    limitStorageTo(400);
    flushPersistedState();
    expect(persistedTabs()[0]).toMatchObject({ content: '', unloaded: true });
    expect(s().notices).toEqual([]);

    await useEditorStore.persist.rehydrate();
    await s().syncTabsWithDisk();
    expect(tab()).toMatchObject({ content: text, isDirty: false });
    expect(tab()?.unloaded).toBeUndefined();
  });

  it('detaches a tab whose text was left out and whose file is gone, so saving cannot wipe it', async () => {
    onDisk({});
    await restore([{ id: 'a', title: 'notes.md', filePath: PATH, content: '', isDirty: false, unloaded: true }]);

    expect(tab()).toMatchObject({ filePath: null, suggestedPath: PATH });
    expect(s().notices).toHaveLength(1);
  });

  it('does nothing on the web', async () => {
    setDesktop(false);
    await restore([{ id: 'a', title: 'notes.md', filePath: 'browser-save', content: 'web', isDirty: false }]);
    expect(invoke).not.toHaveBeenCalled();
    expect(tab()?.content).toBe('web');
  });
});
