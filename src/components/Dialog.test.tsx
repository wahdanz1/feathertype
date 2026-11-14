// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Dialog, type DialogAction } from './Dialog';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

beforeAll(() => {
  // jsdom has no modal dialogs; Chrome's inert background is checked in the browser run.
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const actions = (onClick = () => {}): DialogAction[] => [
  { label: 'Cancel', onClick },
  { label: 'Discard', variant: 'destructive', onClick },
  { label: 'Save', variant: 'primary', onClick },
];

function render(isOpen: boolean, onClose = () => {}) {
  act(() => root.render(
    <>
      <button id="trigger">Close tab</button>
      <Dialog isOpen={isOpen} onClose={onClose} title="Unsaved Changes" description="Save first?" actions={actions()} />
    </>
  ));
}

function mount(isOpen: boolean, onClose?: () => void) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  render(isOpen, onClose);
}

const dialog = () => document.querySelector('dialog')!;
const button = (name: string) =>
  Array.from(dialog().querySelectorAll('button')).find((b) => (b.getAttribute('aria-label') ?? b.textContent) === name)!;

function pressTab(shiftKey = false) {
  const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });
  act(() => { document.activeElement!.dispatchEvent(event); });
  return event;
}

describe('Dialog', () => {
  it('is a labelled modal dialog that focuses its primary action', () => {
    mount(true);
    expect(dialog().hasAttribute('open')).toBe(true);
    expect(document.getElementById(dialog().getAttribute('aria-labelledby')!)!.textContent).toBe('Unsaved Changes');
    expect(document.getElementById(dialog().getAttribute('aria-describedby')!)!.textContent).toBe('Save first?');
    expect(document.activeElement).toBe(button('Save'));
    expect(button('Close dialog')).toBeTruthy();
  });

  it('wraps Tab and Shift+Tab inside the dialog', () => {
    mount(true);
    button('Save').focus();
    expect(pressTab().defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(button('Close dialog'));

    expect(pressTab(true).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(button('Save'));

    button('Cancel').focus();
    expect(pressTab().defaultPrevented).toBe(false);
  });

  it('routes Escape through onClose instead of closing itself', () => {
    const onClose = vi.fn();
    mount(true, onClose);
    const cancel = new Event('cancel', { cancelable: true });
    act(() => { dialog().dispatchEvent(cancel); });
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog().hasAttribute('open')).toBe(true);
  });

  it('returns focus to the element that opened it', () => {
    mount(false);
    const trigger = document.getElementById('trigger')!;
    trigger.focus();
    render(true);
    expect(document.activeElement).toBe(button('Save'));
    render(false);
    expect(document.querySelector('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
