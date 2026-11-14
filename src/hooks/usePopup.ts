import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

interface PopupOptions {
  /** Selectors tried in order for the element that takes focus when the popup opens from the keyboard. */
  initialFocus: string[];
  onKeyDown?: (e: KeyboardEvent, container: HTMLElement) => void;
}

/**
 * Keyboard behaviour shared by toolbar popups. The container must hold the trigger
 * (marked with aria-expanded) and the popup. Focus only moves into the popup when the
 * trigger had focus, so a mouse click leaves the editor focused.
 */
export function usePopup(
  containerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  close: () => void,
  { initialFocus, onKeyDown }: PopupOptions,
) {
  const latest = useRef({ close, onKeyDown, initialFocus });
  useLayoutEffect(() => {
    latest.current = { close, onKeyDown, initialFocus };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!isOpen || !container) return;
    const trigger = container.querySelector<HTMLElement>('[aria-expanded]');
    const fromKeyboard = container.contains(document.activeElement);
    if (fromKeyboard) {
      const first = latest.current.initialFocus.map((s) => container.querySelector<HTMLElement>(s)).find(Boolean);
      first?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        latest.current.close();
        trigger?.focus();
        return;
      }
      latest.current.onKeyDown?.(e, container);
    };
    const handleFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (next && !container.contains(next)) latest.current.close();
    };

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focusout', handleFocusOut);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focusout', handleFocusOut);
      // The picked item unmounts with the popup; unless the action moved focus elsewhere, put it back on the trigger.
      const lost = !document.activeElement || document.activeElement === document.body;
      if (fromKeyboard && (lost || container.contains(document.activeElement))) trigger?.focus();
    };
  }, [containerRef, isOpen]);
}

const MENU_ITEM = '[role^="menuitem"]';

function moveMenuFocus(e: KeyboardEvent, container: HTMLElement) {
  const items = Array.from(container.querySelectorAll<HTMLElement>(MENU_ITEM));
  if (!items.length) return;
  const current = items.indexOf(document.activeElement as HTMLElement);
  const last = items.length - 1;
  const target = {
    ArrowDown: current < 0 || current === last ? 0 : current + 1,
    ArrowUp: current <= 0 ? last : current - 1,
    Home: 0,
    End: last,
  }[e.key];
  if (target === undefined) return;
  e.preventDefault();
  items[target].focus();
}

/** usePopup for role="menu" popups: arrows, Home and End move between menu items. */
export function useMenu(containerRef: RefObject<HTMLElement | null>, isOpen: boolean, close: () => void) {
  usePopup(containerRef, isOpen, close, {
    initialFocus: [`${MENU_ITEM}[aria-checked="true"]`, MENU_ITEM],
    onKeyDown: moveMenuFocus,
  });
}
