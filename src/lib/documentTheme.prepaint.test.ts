import { describe, expect, it } from 'vitest';
import { transformWithEsbuild } from 'vite';
import source from './documentTheme.ts?raw';

// Mirrors the vite.config.ts build: the module is compiled on its own, so an import would break it.
async function runPrePaint(mode: string, pathname: string, stored: string | null) {
  const { code } = await transformWithEsbuild(source, 'documentTheme.ts', { format: 'iife', globalName: 'theme' });
  const classes = new Set<string>();
  const win = {
    location: { pathname },
    localStorage: { getItem: () => stored },
    document: {
      documentElement: {
        classList: { toggle: (name: string, on: boolean) => (on ? classes.add(name) : classes.delete(name)) },
      },
    },
  };
  new Function('window', `${code}theme.applyInitialDocumentTheme(${JSON.stringify(mode)}, window);`)(win);
  return classes;
}

const light = JSON.stringify({ state: { theme: 'light' } });

describe('pre-paint script', () => {
  it('applies the persisted light theme on /editor', async () => {
    expect((await runPrePaint('production', '/editor', light)).has('light-theme')).toBe(true);
  });

  it('keeps / dark with light persisted', async () => {
    expect((await runPrePaint('production', '/', light)).has('light-theme')).toBe(false);
  });

  it('applies light on any route in a tauri build', async () => {
    expect((await runPrePaint('tauri', '/', light)).has('light-theme')).toBe(true);
  });

  it('does not throw on corrupt storage', async () => {
    expect((await runPrePaint('production', '/editor', '{bad')).has('light-theme')).toBe(false);
  });
});
