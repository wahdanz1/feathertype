import { useEffect } from 'react';
import { appCommandFor, appCommands } from '../utils/shortcuts';

/** App-wide shortcuts. Formatting shortcuts are an editor extension, so they only act in the focused editor. */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const command = appCommandFor(e);
      if (!command) return;
      e.preventDefault();
      void appCommands[command]();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
