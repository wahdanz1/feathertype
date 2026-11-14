// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type CloseHandler = (event: { preventDefault: () => void }) => Promise<void>;
const desktop = vi.hoisted(() => ({ handler: null as CloseHandler | null, unlisten: vi.fn(), ask: vi.fn() }));
vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({
    onCloseRequested: async (handler: CloseHandler) => {
      desktop.handler = handler;
      return desktop.unlisten;
    },
  }),
}));
vi.mock('@tauri-apps/plugin-dialog', () => ({ ask: desktop.ask, open: vi.fn(), save: vi.fn() }));

import { useUnsavedChangesGuard } from './useUnsavedChangesGuard';
import { flushPersistedState, useEditorStore } from '../store/useEditorStore';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;

function Guard({ isDesktop }: { isDesktop: boolean }) {
  useUnsavedChangesGuard(isDesktop);
  return null;
}

async function mount(isDesktop: boolean) {
  root = createRoot(document.createElement('div'));
  await act(async () => root.render(<Guard isDesktop={isDesktop} />));
}

const setDirty = (isDirty: boolean) =>
  useEditorStore.setState({ tabs: [{ id: 'a', title: 'A', filePath: null, content: 'x', isDirty }], activeTabId: 'a' });

function unload() {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

async function requestClose() {
  const event = { preventDefault: vi.fn() };
  await desktop.handler!(event);
  return event.preventDefault.mock.calls.length > 0;
}

beforeEach(() => {
  desktop.handler = null;
  desktop.ask.mockReset();
});

afterEach(() => act(() => root.unmount()));

describe('web unload guard', () => {
  it('prompts only while a tab is dirty', async () => {
    await mount(false);
    setDirty(true);
    expect(unload()).toBe(true);
    setDirty(false);
    expect(unload()).toBe(false);
  });
});

describe('desktop close guard', () => {
  it('lets a clean window close without asking', async () => {
    await mount(true);
    setDirty(false);
    expect(await requestClose()).toBe(false);
    expect(desktop.ask).not.toHaveBeenCalled();
  });

  it('keeps a dirty window open unless the user confirms', async () => {
    await mount(true);
    setDirty(true);
    desktop.ask.mockResolvedValueOnce(false);
    expect(await requestClose()).toBe(true);
    desktop.ask.mockResolvedValueOnce(true);
    expect(await requestClose()).toBe(false);
  });

  it('writes the queued session before the window closes', async () => {
    flushPersistedState();
    localStorage.clear();
    await mount(true);
    setDirty(false);
    expect(localStorage.getItem('feathertype-storage')).toBeNull();

    await requestClose();
    expect(JSON.parse(localStorage.getItem('feathertype-storage')!).state.tabs[0].content).toBe('x');
  });

  it('stops listening on unmount', async () => {
    await mount(true);
    act(() => root.unmount());
    expect(desktop.unlisten).toHaveBeenCalled();
    root = createRoot(document.createElement('div'));
  });
});
