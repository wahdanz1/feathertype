// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { redo, undo } from '@codemirror/commands';
import type { EditorView } from '@codemirror/view';
import { Editor } from './Editor';
import { useEditorStore } from '../store/useEditorStore';
import type { Tab } from '../types';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// jsdom has no layout; CodeMirror's measure pass needs these to exist.
const emptyRects = () => Object.assign([], { item: () => null }) as unknown as DOMRectList;
Range.prototype.getClientRects = emptyRects;
Range.prototype.getBoundingClientRect = () => new DOMRect();

// Longer than @uiw's 200 ms typing latch, so deferred value syncs have run.
const SETTLE_MS = 300;
const wait = (ms: number) => act(() => new Promise<void>((r) => setTimeout(r, ms)));

let root: Root;
let container: HTMLDivElement;

const store = () => useEditorStore.getState();
const view = (): EditorView => {
  const v = store().editorView;
  if (!v) throw new Error('no editor view');
  return v;
};
const tab = (id: string) => store().tabs.find((t) => t.id === id)!;

function type(text: string) {
  act(() => {
    const v = view();
    const at = v.state.selection.main.head;
    v.dispatch({ changes: { from: at, insert: text }, selection: { anchor: at + text.length }, userEvent: 'input.type' });
  });
}

const run = (command: (v: EditorView) => boolean) => act(() => { command(view()); });

async function mount(tabs: Tab[] = [{ id: 'a', title: 'A', filePath: null, content: '', isDirty: false }]) {
  useEditorStore.setState({ tabs, activeTabId: tabs[0].id, editorView: null });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<Editor />));
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('Editor tab isolation', () => {
  it('undo in a fresh tab never yields another tab’s text', async () => {
    await mount();
    type('tab A secret');
    await wait(SETTLE_MS);
    let b = '';
    act(() => { b = store().addTab(); });
    await wait(SETTLE_MS);

    run(undo);
    run(undo);
    await wait(SETTLE_MS);

    expect(view().state.doc.toString()).toBe('');
    expect(tab(b)).toMatchObject({ content: '', isDirty: false });
    expect(tab('a').content).toBe('tab A secret');
  });

  it('typing right after a fast switch lands only in the new tab', async () => {
    await mount();
    type('tab A');
    let b = '';
    act(() => { b = store().addTab(); });
    type('x');
    await wait(SETTLE_MS);

    expect(tab(b).content).toBe('x');
    expect(tab('a').content).toBe('tab A');
    expect(view().state.doc.toString()).toBe('x');
  });

  it('switching tabs never marks a clean tab dirty, even after undo', async () => {
    await mount([
      { id: 'a', title: 'A', filePath: null, content: 'saved A', isDirty: false },
      { id: 'b', title: 'B', filePath: null, content: 'saved B', isDirty: false },
    ]);
    act(() => store().setActiveTab('b'));
    await wait(SETTLE_MS);
    act(() => store().setActiveTab('a'));
    await wait(SETTLE_MS);
    run(undo);
    await wait(SETTLE_MS);

    expect(view().state.doc.toString()).toBe('saved A');
    expect(tab('a')).toMatchObject({ content: 'saved A', isDirty: false });
    expect(tab('b')).toMatchObject({ content: 'saved B', isDirty: false });
  });

  it('keeps each tab’s history and selection across a round trip', async () => {
    await mount();
    type('one');
    await wait(SETTLE_MS);
    act(() => { view().dispatch({ selection: { anchor: 1 } }); });
    let b = '';
    act(() => { b = store().addTab(); });
    await wait(SETTLE_MS);
    type('two');
    await wait(SETTLE_MS);

    act(() => store().setActiveTab('a'));
    await wait(SETTLE_MS);
    expect(view().state.doc.toString()).toBe('one');
    expect(view().state.selection.main.head).toBe(1);

    run(undo);
    await wait(SETTLE_MS);
    expect(tab('a').content).toBe('');
    run(redo);
    await wait(SETTLE_MS);
    expect(tab('a').content).toBe('one');

    act(() => store().setActiveTab(b));
    await wait(SETTLE_MS);
    run(undo);
    await wait(SETTLE_MS);
    expect(tab(b).content).toBe('');
    expect(tab('a').content).toBe('one');
  });

  it('closing a tab hands the view to the next tab with its history intact', async () => {
    await mount();
    type('keep');
    await wait(SETTLE_MS);
    let b = '';
    act(() => { b = store().addTab(); });
    await wait(SETTLE_MS);
    act(() => store().closeTab(b));
    await wait(SETTLE_MS);

    expect(store().tabs.map((t) => t.id)).toEqual(['a']);
    expect(view().state.doc.toString()).toBe('keep');
    run(undo);
    await wait(SETTLE_MS);
    expect(tab('a').content).toBe('');
  });
});
