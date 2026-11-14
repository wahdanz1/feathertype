// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { Toolbar } from './Toolbar';
import { editorUpdates } from '../lib/editorUpdates';
import { useEditorStore } from '../store/useEditorStore';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;
let view: EditorView;

const isActive = (title: string) =>
  container.querySelector(`button[title^="${title}"]`)!.className.includes('border-theme-primary');

function mount(doc: string) {
  view = new EditorView({ state: EditorState.create({ doc, extensions: [editorUpdates] }) });
  useEditorStore.setState({ editorView: view });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<MemoryRouter><Toolbar /></MemoryRouter>));
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  view.destroy();
  useEditorStore.setState({ editorView: null });
});

describe('Toolbar', () => {
  it('tracks the format under the cursor from editor updates alone', () => {
    mount('plain **bold** text');
    expect(isActive('Bold')).toBe(false);

    act(() => view.dispatch({ selection: { anchor: 10 } }));
    expect(isActive('Bold')).toBe(true);

    act(() => view.dispatch({ selection: { anchor: 2 } }));
    expect(isActive('Bold')).toBe(false);
  });

  it('reflects a format the toolbar just applied', () => {
    mount('- item');
    expect(isActive('Bullet List')).toBe(true);

    act(() => container.querySelector<HTMLButtonElement>('button[title^="Bullet List"]')!.click());
    expect(view.state.doc.toString()).toBe('item');
    expect(isActive('Bullet List')).toBe(false);
  });
});
