import { useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { ask } from '@tauri-apps/plugin-dialog';
import { useEditorStore } from '../store/useEditorStore';

export const hasDirtyTabs = () => useEditorStore.getState().tabs.some((tab) => tab.isDirty);

async function confirmDesktopClose(): Promise<boolean> {
  try {
    return await ask('Some tabs have unsaved changes. Close anyway?', {
      title: 'Unsaved Changes',
      kind: 'warning',
      okLabel: 'Close',
      cancelLabel: 'Cancel',
    });
  } catch (error) {
    // A broken dialog must not leave a window that can never close.
    console.error('Close confirmation failed:', error);
    return true;
  }
}

export function useUnsavedChangesGuard(isDesktop: boolean) {
  useEffect(() => {
    if (isDesktop) {
      let unlisten: (() => void) | undefined;
      let disposed = false;
      getCurrentWindow()
        .onCloseRequested(async (event) => {
          if (hasDirtyTabs() && !(await confirmDesktopClose())) event.preventDefault();
        })
        .then((stop) => {
          if (disposed) stop();
          else unlisten = stop;
        })
        .catch((error) => console.error('Close guard unavailable:', error));
      return () => {
        disposed = true;
        unlisten?.();
      };
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasDirtyTabs()) return;
      event.preventDefault();
      // Older Safari only prompts when returnValue is set.
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDesktop]);
}
