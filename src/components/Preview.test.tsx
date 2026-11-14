// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Preview } from './Preview';
import { useEditorStore } from '../store/useEditorStore';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

const text = () => container.textContent;
const setContent = (content: string) => act(() => useEditorStore.getState().updateTabContent('a', content));

function mount() {
  useEditorStore.setState({
    tabs: [
      { id: 'a', title: 'A', filePath: null, content: '# Alpha', isDirty: false },
      { id: 'b', title: 'B', filePath: null, content: '# Beta', isDirty: false },
    ],
    activeTabId: 'a',
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<Preview />));
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

describe('Preview', () => {
  it('renders the document immediately on mount', () => {
    mount();
    expect(container.querySelector('h1')?.textContent).toBe('Alpha');
  });

  it('skips renders while typing and settles on the final text', () => {
    mount();
    for (const content of ['# Alpha 1', '# Alpha 12', '# Alpha 123']) {
      setContent(content);
      act(() => vi.advanceTimersByTime(50));
    }
    expect(text()).toBe('Alpha');

    act(() => vi.advanceTimersByTime(1000));
    expect(container.querySelector('h1')?.textContent).toBe('Alpha 123');
  });

  it('shows the new tab right away when switching', () => {
    mount();
    act(() => useEditorStore.getState().setActiveTab('b'));
    expect(container.querySelector('h1')?.textContent).toBe('Beta');
  });
});
