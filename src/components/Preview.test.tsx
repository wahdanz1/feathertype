// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Preview } from './Preview';
import { useEditorStore } from '../store/useEditorStore';

vi.mock('@tauri-apps/plugin-opener', () => ({ openUrl: vi.fn(() => Promise.resolve()) }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

const text = () => container.textContent;
const setContent = (content: string) => act(() => useEditorStore.getState().updateTabContent('a', content));

function mount(content = '# Alpha') {
  useEditorStore.setState({
    tabs: [
      { id: 'a', title: 'A', filePath: null, content, isDirty: false },
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
  vi.mocked(openUrl).mockClear();
  delete window.__TAURI_INTERNALS__;
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

describe('Preview links', () => {
  const link = (name: string) =>
    [...container.querySelectorAll('a')].find((a) => a.textContent === name) as HTMLAnchorElement;

  // dispatchEvent returns false when a handler called preventDefault.
  const click = (el: Element, button = 0) =>
    el.dispatchEvent(new MouseEvent(button === 0 ? 'click' : 'auxclick', { bubbles: true, cancelable: true, button }));

  const desktop = () => {
    window.__TAURI_INTERNALS__ = {};
  };

  it('opens external links in the system browser on desktop', () => {
    desktop();
    mount('[site](https://example.com/page) [mail](mailto:hi@example.com) [plain](http://example.com)');

    expect(click(link('site'))).toBe(false);
    expect(click(link('mail'))).toBe(false);
    expect(click(link('plain'), 1)).toBe(false);
    expect(vi.mocked(openUrl).mock.calls).toEqual([
      ['https://example.com/page'],
      ['mailto:hi@example.com'],
      ['http://example.com'],
    ]);
  });

  it('opens external links in a new tab on the web', () => {
    mount('[site](https://example.com)');
    const a = link('site');

    expect(a.getAttribute('href')).toBe('https://example.com');
    expect(a.target).toBe('_blank');
    expect(a.rel).toBe('noopener noreferrer');
    expect(openUrl).not.toHaveBeenCalled();
  });

  it('leaves same-document anchors to the browser', () => {
    desktop();
    mount('[jump](#section) and a note[^1]\n\n[^1]: The note.');

    for (const a of [link('jump'), container.querySelector<HTMLAnchorElement>('a[data-footnote-ref]')!]) {
      expect(a.getAttribute('href')).toMatch(/^#/);
      expect(a.hasAttribute('target')).toBe(false);
      expect(click(a)).toBe(true);
    }
    expect(openUrl).not.toHaveBeenCalled();
  });

  it.each([false, true])('drops the href of links it will not open (desktop: %s)', (isDesktop) => {
    if (isDesktop) desktop();
    mount('[tel](tel:123) [rel](./notes.md) [file](file:///C:/notes.md) [js](javascript:alert(1))');

    for (const name of ['tel', 'rel', 'file', 'js']) {
      expect(link(name).hasAttribute('href')).toBe(false);
      click(link(name));
    }
    expect(openUrl).not.toHaveBeenCalled();
  });
});
