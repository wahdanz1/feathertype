import { afterEach, describe, expect, it, vi } from 'vitest';
import { openUrl } from '@tauri-apps/plugin-opener';
import { isOpenableUrl, openExternal } from './externalLinks';

vi.mock('@tauri-apps/plugin-opener', () => ({ openUrl: vi.fn(() => Promise.resolve()) }));

const open = vi.fn();
vi.stubGlobal('window', { open });

afterEach(() => {
  vi.mocked(openUrl).mockClear();
  open.mockClear();
  delete window.__TAURI_INTERNALS__;
});

describe('isOpenableUrl', () => {
  it.each(['https://a.com', 'http://a.com/x?y#z', 'mailto:a@b.com'])('accepts %s', (url) => {
    expect(isOpenableUrl(url)).toBe(true);
  });

  it.each(['#top', './a.md', '/a', 'tel:1', 'file:///C:/a', 'javascript:alert(1)', ''])('rejects %s', (url) => {
    expect(isOpenableUrl(url)).toBe(false);
  });
});

describe('openExternal', () => {
  it('uses the opener plugin on desktop', () => {
    window.__TAURI_INTERNALS__ = {};
    openExternal('https://a.com');
    expect(openUrl).toHaveBeenCalledWith('https://a.com');
    expect(open).not.toHaveBeenCalled();
  });

  it('opens a detached tab on the web', () => {
    openExternal('https://a.com');
    expect(open).toHaveBeenCalledWith('https://a.com', '_blank', 'noopener,noreferrer');
    expect(openUrl).not.toHaveBeenCalled();
  });

  it('ignores other schemes', () => {
    window.__TAURI_INTERNALS__ = {};
    openExternal('file:///C:/a');
    expect(openUrl).not.toHaveBeenCalled();
  });
});
