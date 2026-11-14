// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { StatusBar } from './StatusBar';
import { editorUpdates } from '../lib/editorUpdates';
import { useEditorStore } from '../store/useEditorStore';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;
let view: EditorView;

const text = () => container.textContent;

function mount(doc: string) {
  view = new EditorView({ state: EditorState.create({ doc, extensions: [editorUpdates] }) });
  useEditorStore.setState({ editorView: view, zoom: 100 });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<StatusBar />));
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  view.destroy();
  useEditorStore.setState({ editorView: null });
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('StatusBar', () => {
  it('shows position and selection as soon as the selection changes, with no timer', () => {
    mount('# Title\nsome **bold** text');
    expect(text()).toContain('Ln 1, Col 1');

    act(() => view.dispatch({ selection: { anchor: 13, head: 21 } }));
    expect(text()).toContain('Ln 2, Col 14');
    expect(text()).toContain('4 selected');

    act(() => view.dispatch({ selection: { anchor: 0 } }));
    expect(text()).toContain('Ln 1, Col 1');
    expect(text()).not.toContain('selected');
  });

  it('recounts the document once typing pauses', () => {
    mount('**ab**');
    expect(text()).toContain('2 characters');

    act(() => {
      view.dispatch({ changes: { from: 4, insert: 'c' } });
      view.dispatch({ changes: { from: 5, insert: 'd' } });
    });
    expect(text()).toContain('2 characters');

    act(() => vi.advanceTimersByTime(1000));
    expect(text()).toContain('4 characters');
  });

  it('follows a new editor view', () => {
    mount('one');
    const other = new EditorView({ state: EditorState.create({ doc: 'two\nlines', selection: { anchor: 6 }, extensions: [editorUpdates] }) });
    act(() => useEditorStore.setState({ editorView: other }));
    expect(text()).toContain('Ln 2, Col 3');
    expect(text()).toContain('9 characters');
    other.destroy();
  });

  it('never polls and leaves no timer behind after unmount', () => {
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    mount('text');
    act(() => view.dispatch({ changes: { from: 4, insert: '!' } }));
    const pending = vi.getTimerCount();
    act(() => root.unmount());
    root = createRoot(container);

    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(pending - 1);
  });
});
