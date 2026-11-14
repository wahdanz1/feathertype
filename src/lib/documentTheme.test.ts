// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { useEditorStore } from '../store/useEditorStore';
import {
  THEME_STORAGE_KEY,
  detectTauri,
  isEditorRoute,
  readPersistedTheme,
  syncDocumentTheme,
} from './documentTheme';

const persist = (value: string) => localStorage.setItem(THEME_STORAGE_KEY, value);
const lightState = JSON.stringify({ state: { theme: 'light' }, version: 0 });

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
});

describe('readPersistedTheme', () => {
  it('reads the persisted light theme', () => {
    persist(lightState);
    expect(readPersistedTheme(window)).toBe('light');
  });

  it.each([
    ['missing', null],
    ['corrupt JSON', '{not json'],
    ['no state', '{}'],
    ['unknown value', JSON.stringify({ state: { theme: 'sepia' } })],
  ])('falls back to dark when storage is %s', (_label, value) => {
    if (value !== null) persist(value);
    expect(readPersistedTheme(window)).toBe('dark');
  });

  it('falls back to dark when storage access throws', () => {
    const blocked = {
      get localStorage(): Storage {
        throw new DOMException('denied', 'SecurityError');
      },
    };
    expect(readPersistedTheme(blocked)).toBe('dark');
  });

  it('uses the same key the store persists under', () => {
    expect(useEditorStore.persist.getOptions().name).toBe(THEME_STORAGE_KEY);
  });
});

describe('isEditorRoute', () => {
  it.each(['/', '/download', '/contact', '/privacy', '/editor/extra'])('%s is a marketing route on web', (path) => {
    expect(isEditorRoute(path, false)).toBe(false);
  });

  it('/editor is the editor on web', () => {
    expect(isEditorRoute('/editor', false)).toBe(true);
  });

  it('every route is the editor in Tauri', () => {
    expect(isEditorRoute('/', true)).toBe(true);
  });
});

describe('detectTauri', () => {
  it('trusts the tauri build mode', () => {
    expect(detectTauri('tauri', {})).toBe(true);
  });

  it('detects tauri dev by its injected internals', () => {
    expect(detectTauri('development', { __TAURI_INTERNALS__: {} })).toBe(true);
    expect(detectTauri('development', {})).toBe(false);
  });

  it('ignores injected internals in a web production build', () => {
    expect(detectTauri('production', { __TAURI_INTERNALS__: {} })).toBe(false);
  });
});

describe('syncDocumentTheme', () => {
  const html = () => document.documentElement.classList;

  it('keeps marketing pages dark when light is persisted', () => {
    syncDocumentTheme(document, 'light', false);
    expect(html().contains('light-theme')).toBe(false);
  });

  it('applies light to the editor', () => {
    syncDocumentTheme(document, 'light', true);
    expect(html().contains('light-theme')).toBe(true);
    expect(html().contains('is-editor')).toBe(true);
  });

  it('switches both ways when navigating between editor and marketing', () => {
    syncDocumentTheme(document, 'light', true);
    syncDocumentTheme(document, 'light', false);
    expect(html().contains('light-theme')).toBe(false);
    expect(html().contains('is-editor')).toBe(false);
    syncDocumentTheme(document, 'light', true);
    expect(html().contains('light-theme')).toBe(true);
  });

  it('leaves unrelated classes alone', () => {
    html().add('other');
    syncDocumentTheme(document, 'light', true);
    expect(html().contains('other')).toBe(true);
  });
});
