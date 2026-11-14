import { openUrl } from '@tauri-apps/plugin-opener';
import { isTauri } from './platform';

const OPENABLE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

export function isOpenableUrl(href: string): boolean {
  try {
    return OPENABLE_PROTOCOLS.has(new URL(href).protocol);
  } catch {
    return false;
  }
}

export function openExternal(url: string): void {
  if (!isOpenableUrl(url)) return;
  if (isTauri()) {
    openUrl(url).catch((error: unknown) => console.error(`Failed to open ${url}`, error));
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
