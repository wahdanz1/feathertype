// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const invoke = vi.hoisted(() => vi.fn());
const save = vi.hoisted(() => vi.fn());
vi.mock('@tauri-apps/api/core', () => ({ invoke }));
vi.mock('@tauri-apps/plugin-dialog', () => ({ save, open: vi.fn() }));
vi.mock('../utils/docxExport', () => ({ markdownToDocxBuffer: async () => new ArrayBuffer(4) }));

import { useEditorStore } from './useEditorStore';
import { exportAsDocx, handleSaveFile, openFile } from '../utils/fileOperations';
import type { Tab } from '../types';

const STORAGE_KEY = 'feathertype-storage';
const s = () => useEditorStore.getState();
const tab = () => s().tabs.find((t) => t.id === 'a');

let downloads: string[];
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
  localStorage.clear();
  setDesktop(false);
  invoke.mockReset();
  save.mockReset();
  downloads = [];
  URL.createObjectURL = vi.fn(() => 'blob:test');
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    downloads.push(this.download);
  });
  alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null);
  vi.spyOn(console, 'error').mockImplementation(() => {});
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
