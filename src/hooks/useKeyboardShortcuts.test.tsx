// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EditorView } from '@codemirror/view';
import { Editor } from '../components/Editor';
import { TabBar } from '../components/TabBar';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useEditorStore } from '../store/useEditorStore';
import { handleSaveAsFile, handleSaveFile } from '../utils/fileOperations';

vi.mock('../utils/fileOperations', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../utils/fileOperations')>()),
  handleSaveFile: vi.fn(async () => true),
  handleSaveAsFile: vi.fn(async () => true),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// jsdom has no layout; CodeMirror's measure pass needs these to exist.
const emptyRects = () => Object.assign([], { item: () => null }) as unknown as DOMRectList;
Range.prototype.getClientRects = emptyRects;
Range.prototype.getBoundingClientRect = () => new DOMRect();

let root: Root;
let container: HTMLDivElement;

const store = () => useEditorStore.getState();
const view = (): EditorView => store().editorView!;
const doc = () => view().state.doc.toString();

function Harness() {
  useKeyboardShortcuts();
  return <><TabBar /><Editor /></>;
}

async function mount(content: string) {
  useEditorStore.setState({
    tabs: [{ id: 'a', title: 'A', filePath: null, content, isDirty: false }],
    activeTabId: 'a',
    editorView: null,
    showPreview: false,
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<Harness />));
}

// keyCode is what CodeMirror reads to recover the base key when Caps Lock or Shift changes e.key.
function press(target: EventTarget, init: KeyboardEventInit & { keyCode?: number }) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  if (init.keyCode) Object.defineProperty(event, 'keyCode', { value: init.keyCode });
  act(() => { target.dispatchEvent(event); });
  return event;
}

beforeEach(() => vi.clearAllMocks());

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('editing shortcuts', () => {
  it('Ctrl+I in a word italicises only that word', async () => {
    await mount('hello world foo bar');
    act(() => view().dispatch({ selection: { anchor: 8 } }));
    press(view().contentDOM, { key: 'i', code: 'KeyI', keyCode: 73, ctrlKey: true });
    expect(doc()).toBe('hello _world_ foo bar');
  });

  it('Ctrl+B with Caps Lock still bolds', async () => {
    await mount('hello world');
    act(() => view().dispatch({ selection: { anchor: 8 } }));
    press(view().contentDOM, { key: 'B', code: 'KeyB', keyCode: 66, ctrlKey: true });
    expect(doc()).toBe('hello **world**');
  });

  it('Ctrl+B in the tab rename input leaves the document alone', async () => {
    await mount('hello world');
    act(() => {
      container.querySelector('[role="tab"] span')!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    });
    const input = container.querySelector<HTMLInputElement>('input[aria-label="Tab name"]')!;
    expect(document.activeElement).toBe(input);
    press(input, { key: 'b', code: 'KeyB', keyCode: 66, ctrlKey: true });
    expect(doc()).toBe('hello world');
  });
});

describe('app shortcuts', () => {
  it('Ctrl+S with Caps Lock saves and blocks the browser save dialog', async () => {
    await mount('text');
    const event = press(document.body, { key: 'S', code: 'KeyS', keyCode: 83, ctrlKey: true });
    expect(handleSaveFile).toHaveBeenCalledTimes(1);
    expect(handleSaveAsFile).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it('Ctrl+Shift+S with Caps Lock saves as', async () => {
    await mount('text');
    press(document.body, { key: 's', code: 'KeyS', keyCode: 83, ctrlKey: true, shiftKey: true });
    expect(handleSaveAsFile).toHaveBeenCalledTimes(1);
    expect(handleSaveFile).not.toHaveBeenCalled();
  });

  it('AltGr+\\ is not taken for Ctrl+\\ (toggle preview)', async () => {
    await mount('');
    const event = press(document.body, { key: '\\', code: 'Minus', ctrlKey: true, altKey: true });
    expect(store().showPreview).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });
});
