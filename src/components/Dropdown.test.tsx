// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dropdown } from './Dropdown';
import { TableGridSelector } from './TableGridSelector';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const options = [
  { value: '', label: 'No Heading' },
  { value: 'h1', label: 'H1' },
  { value: 'h2', label: 'H2' },
];

const trigger = () => container.querySelector<HTMLButtonElement>('[aria-expanded]')!;
const focused = () => (document.activeElement as HTMLElement).textContent;

function press(key: string) {
  act(() => {
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  });
}

function click(el: HTMLElement) {
  act(() => el.click());
}

describe('Dropdown', () => {
  beforeEach(() => {
    act(() => root.render(<Dropdown value="h1" onChange={() => {}} options={options} title="Heading" />));
  });

  it('opens from the keyboard onto the selected item', () => {
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
    trigger().focus();
    click(trigger());
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('[role="menu"]')).toBeTruthy();
    expect(document.activeElement!.getAttribute('aria-checked')).toBe('true');
    expect(focused()).toBe('H1');
  });

  it('moves with arrows, Home and End, wrapping at the ends', () => {
    trigger().focus();
    click(trigger());
    press('ArrowDown');
    expect(focused()).toBe('H2');
    press('ArrowDown');
    expect(focused()).toBe('No Heading');
    press('ArrowUp');
    expect(focused()).toBe('H2');
    press('Home');
    expect(focused()).toBe('No Heading');
    press('End');
    expect(focused()).toBe('H2');
  });

  it('closes on Escape and returns focus to the trigger', () => {
    trigger().focus();
    click(trigger());
    press('Escape');
    expect(container.querySelector('[role="menu"]')).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger());
  });

  it('leaves focus alone when opened by a pointer', () => {
    (document.activeElement as HTMLElement | null)?.blur();
    click(trigger());
    expect(container.querySelector('[role="menu"]')).toBeTruthy();
    expect(document.activeElement).toBe(document.body);
  });
});

describe('TableGridSelector', () => {
  it('sizes with arrows, announces the size and inserts with Enter', () => {
    const onInsert = vi.fn();
    act(() => root.render(<TableGridSelector onInsert={onInsert} />));
    trigger().focus();
    click(trigger());
    expect(document.activeElement!.getAttribute('data-cell')).toBe('0');

    press('ArrowRight');
    press('ArrowRight');
    press('ArrowDown');
    expect(container.querySelector('[role="status"]')!.textContent).toBe('3 × 2 Table');
    expect(document.activeElement!.getAttribute('aria-label')).toBe('3 × 2');

    click(document.activeElement as HTMLElement);
    expect(onInsert).toHaveBeenCalledWith(2, 3);
    expect(container.querySelector('[role="status"]')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('closes on Escape and returns focus to the trigger', () => {
    act(() => root.render(<TableGridSelector onInsert={() => {}} />));
    trigger().focus();
    click(trigger());
    press('Escape');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger());
  });
});
