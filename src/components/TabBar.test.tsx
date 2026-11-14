// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TabBar } from './TabBar';
import { useEditorStore } from '../store/useEditorStore';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

const tab = (id: string, isDirty = false) => ({ id, title: id.toUpperCase(), filePath: null, content: '', isDirty });

beforeEach(() => {
  useEditorStore.setState({
    tabs: [tab('a'), tab('b', true), tab('c')],
    activeTabId: 'a',
    unsavedChangesDialog: { isOpen: false, tabId: null },
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<TabBar />));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const tabs = () => Array.from(container.querySelectorAll<HTMLElement>('[role="tab"]'));
const tabNamed = (title: string) => tabs().find((t) => t.textContent!.startsWith(title))!;
const state = () => useEditorStore.getState();

function press(key: string, target = document.activeElement as HTMLElement) {
  act(() => { target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })); });
}

describe('TabBar keyboard', () => {
  it('exposes a tablist with one tab stop on the active tab', () => {
    expect(container.querySelector('[role="tablist"]')).toBeTruthy();
    expect(tabs().map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(tabs().map((t) => t.tabIndex)).toEqual([0, -1, -1]);
    expect(tabNamed('B').textContent).toContain('unsaved changes');
  });

  it('moves focus with arrows, Home and End without activating', () => {
    tabNamed('A').focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(tabNamed('B'));
    press('End');
    expect(document.activeElement).toBe(tabNamed('C'));
    press('ArrowRight');
    expect(document.activeElement).toBe(tabNamed('A'));
    press('ArrowLeft');
    expect(document.activeElement).toBe(tabNamed('C'));
    press('Home');
    expect(document.activeElement).toBe(tabNamed('A'));
    expect(state().activeTabId).toBe('a');
  });

  it('activates the focused tab with Enter or Space', () => {
    tabNamed('C').focus();
    press('Enter');
    expect(state().activeTabId).toBe('c');
    tabNamed('A').focus();
    press(' ');
    expect(state().activeTabId).toBe('a');
  });

  it('renames with F2 and returns focus to the tab', () => {
    tabNamed('A').focus();
    press('F2');
    const input = container.querySelector('input')!;
    expect(document.activeElement).toBe(input);
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Notes');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    press('Enter', input);
    expect(state().tabs[0].title).toBe('Notes');
    expect(document.activeElement).toBe(tabNamed('Notes'));
  });

  it('closes a clean tab with Delete and keeps focus in the tablist', () => {
    tabNamed('C').focus();
    press('Delete');
    expect(state().tabs.map((t) => t.id)).toEqual(['a', 'b']);
    expect(document.activeElement).toBe(tabNamed('A'));
  });

  it('sends Delete on a dirty tab through the unsaved-changes flow', () => {
    tabNamed('B').focus();
    press('Delete');
    expect(state().tabs).toHaveLength(3);
    expect(state().unsavedChangesDialog).toEqual({ isOpen: true, tabId: 'b' });
  });
});
