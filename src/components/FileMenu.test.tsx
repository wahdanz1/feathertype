// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileMenu } from './FileMenu';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<FileMenu />));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const trigger = () => container.querySelector<HTMLButtonElement>('button[title="File menu"]')!;
const menu = () => container.querySelector('[role="menu"]');
const focused = () => (document.activeElement as HTMLElement).querySelector('span')?.textContent;

function press(key: string) {
  act(() => {
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  });
}

describe('FileMenu', () => {
  it('opens with ArrowDown onto the first item and moves with arrows, Home and End', () => {
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
    trigger().focus();
    press('ArrowDown');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(menu()).toBeTruthy();
    expect(focused()).toBe('New');
    press('ArrowDown');
    expect(focused()).toBe('Open');
    press('ArrowUp');
    press('ArrowUp');
    expect(focused()).toBe('Export as DOCX');
    press('Home');
    expect(focused()).toBe('New');
    press('End');
    expect(focused()).toBe('Export as DOCX');
  });

  it('closes on Escape and returns focus to the trigger', () => {
    trigger().focus();
    act(() => trigger().click());
    expect(focused()).toBe('New');
    press('Escape');
    expect(menu()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger());
  });
});
