// Also compiled standalone into the pre-paint script (see vite.config.ts), so it must not import anything.

export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'feathertype-storage';

export function detectTauri(mode: string, win: { __TAURI_INTERNALS__?: unknown } | undefined): boolean {
  return mode === 'tauri' || (mode === 'development' && win?.__TAURI_INTERNALS__ !== undefined);
}

export function isEditorRoute(pathname: string, isTauri: boolean): boolean {
  return isTauri || pathname === '/editor';
}

export function readPersistedTheme(win: Pick<Window, 'localStorage'>): Theme {
  try {
    const raw = win.localStorage.getItem(THEME_STORAGE_KEY);
    return raw && JSON.parse(raw)?.state?.theme === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

// Classes live on <html> so the pre-paint script can set them from <head>, before <body> exists.
export function syncDocumentTheme(doc: Document, theme: Theme, isEditor: boolean): void {
  doc.documentElement.classList.toggle('light-theme', isEditor && theme === 'light');
  doc.documentElement.classList.toggle('is-editor', isEditor);
}

export function applyInitialDocumentTheme(mode: string, win: Window): void {
  const isEditor = isEditorRoute(win.location.pathname, detectTauri(mode, win));
  syncDocumentTheme(win.document, readPersistedTheme(win), isEditor);
}
