import { Prec, type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { useEditorStore } from '../store/useEditorStore';
import { openFile, handleSaveFile, handleSaveAsFile, isTauri } from './fileOperations';
import { formats } from './markdownFormatting';

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);

const store = () => useEditorStore.getState();

async function openInNewTab() {
  try {
    const opened = await openFile();
    if (opened) store().addTab({ ...opened, isDirty: false });
  } catch (error) {
    console.error('Failed to open file:', error);
    alert('Failed to open file: ' + error);
  }
}

async function saveActiveTab(save: typeof handleSaveFile) {
  const { getActiveTab, markTabClean, updateTabPath } = store();
  const tab = getActiveTab();
  if (tab) await save(tab, markTabClean, updateTabPath);
}

export const appCommands = {
  new: () => { store().addTab(); },
  open: openInNewTab,
  save: () => saveActiveTab(handleSaveFile),
  saveAs: () => saveActiveTab(handleSaveAsFile),
  togglePreview: () => store().togglePreview(),
  lineWrap: () => store().toggleLineWrap(),
  zoomIn: () => store().zoomIn(),
  zoomOut: () => store().zoomOut(),
  resetZoom: () => store().resetZoom(),
};

type AppCommand = keyof typeof appCommands;

const formatCommands = {
  bold: formats.bold,
  italic: formats.italic,
  link: formats.link,
  inlineCode: formats.inlineCode,
  comment: formats.comment,
  heading1: formats.heading1,
  heading2: formats.heading2,
  heading3: formats.heading3,
  bulletList: formats.bulletList,
  numberedList: formats.numberedList,
};

type FormatCommand = keyof typeof formatCommands;
export type ShortcutId = AppCommand | FormatCommand;

export const SHORTCUTS: Record<ShortcutId, string> = {
  new: 'Mod-n',
  open: 'Mod-o',
  save: 'Mod-s',
  saveAs: 'Mod-Shift-s',
  togglePreview: 'Mod-\\',
  lineWrap: 'Alt-z',
  zoomIn: 'Mod-=',
  zoomOut: 'Mod--',
  resetZoom: 'Mod-0',
  bold: 'Mod-b',
  italic: 'Mod-i',
  link: 'Mod-k',
  inlineCode: 'Mod-`',
  comment: 'Mod-?',
  heading1: 'Mod-1',
  heading2: 'Mod-2',
  heading3: 'Mod-3',
  bulletList: 'Mod-Shift-b',
  numberedList: 'Mod-Shift-n',
};

// Chrome hands these to the browser (new window, new incognito window) before the page sees them.
const BROWSER_RESERVED = new Set<ShortcutId>(['new', 'numberedList']);

interface Chord {
  key: string;
  mod: boolean;
  shift: boolean;
  alt: boolean;
}

function parse(spec: string): Chord {
  const parts = spec.split(/-(?!$)/);
  const key = parts.pop()!;
  return { key, mod: parts.includes('Mod'), shift: parts.includes('Shift'), alt: parts.includes('Alt') };
}

function bindings<T extends ShortcutId>(ids: T[], extra: [string, T][] = []): [Chord, T][] {
  return [...ids.map((id) => [SHORTCUTS[id], id] as [string, T]), ...extra].map(([spec, id]) => [parse(spec), id]);
}

const APP_BINDINGS = bindings(Object.keys(appCommands) as AppCommand[], [['Mod-+', 'zoomIn']]);
const FORMAT_BINDINGS = bindings(Object.keys(formatCommands) as FormatCommand[]);

const ALNUM = /^[a-z0-9]$/;

// The key as the layout types it, so Ctrl+S means the key labelled S on any Latin layout and Caps Lock
// doesn't matter. Non-Latin layouts type other letters, so with Ctrl held fall back to the physical key.
function keyOf(e: KeyboardEvent, mod: boolean): string {
  if (/^[\x21-\x7e]$/.test(e.key)) return e.key.toLowerCase();
  const physical = mod ? /^(?:Key|Digit)(.)$/.exec(e.code)?.[1] : undefined;
  return physical ? physical.toLowerCase() : e.key;
}

function matches(chord: Chord, e: KeyboardEvent): boolean {
  const mod = IS_MAC ? e.metaKey : e.ctrlKey;
  const otherMod = IS_MAC ? e.ctrlKey : e.metaKey;
  // Ctrl+Alt is AltGr on Windows, which types characters such as \ on Nordic layouts.
  if (mod !== chord.mod || otherMod || e.altKey !== chord.alt) return false;
  // Shift is how some layouts type ? or +, so it only counts for letters and digits.
  if (ALNUM.test(chord.key) && e.shiftKey !== chord.shift) return false;
  return keyOf(e, mod) === chord.key;
}

const find = <T>(list: [Chord, T][], e: KeyboardEvent) => list.find(([chord]) => matches(chord, e))?.[1];

export const appCommandFor = (e: KeyboardEvent): AppCommand | undefined => find(APP_BINDINGS, e);

// Highest precedence so these run before CodeMirror's own bindings, such as Mod-i (select parent syntax).
export const formattingShortcuts: Extension = Prec.highest(
  EditorView.domEventHandlers({
    keydown(event, view) {
      const id = find(FORMAT_BINDINGS, event);
      if (!id) return false;
      event.preventDefault();
      formatCommands[id](view);
      return true;
    },
  }),
);

const KEY_LABELS: Record<string, string> = { Mod: IS_MAC ? 'Cmd' : 'Ctrl', Alt: IS_MAC ? 'Option' : 'Alt', Shift: 'Shift' };

/** The shortcut as shown in menus and tooltips, or undefined where the browser keeps the keys. */
export function shortcutHint(id: ShortcutId): string | undefined {
  if (BROWSER_RESERVED.has(id) && !isTauri()) return undefined;
  const parts = SHORTCUTS[id].split(/-(?!$)/);
  return parts.map((part) => KEY_LABELS[part] ?? part.toUpperCase()).join('+');
}

export function withHint(label: string, id: ShortcutId): string {
  const hint = shortcutHint(id);
  return hint ? `${label} (${hint})` : label;
}
