import { EditorSelection, type ChangeSpec, type EditorState } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { treeUpTo, type SyntaxNode } from './markdownSyntax';

interface FormatAction {
  prefix?: string;      // e.g., "**" for bold
  suffix?: string;      // e.g., "**" for bold
  linePrefix?: string;  // e.g., "# " for heading
  placeholder?: string; // text when nothing selected
}

const SPANS = {
  '**': { node: 'StrongEmphasis', mark: 'EmphasisMark' },
  '_': { node: 'Emphasis', mark: 'EmphasisMark' },
  '~~': { node: 'Strikethrough', mark: 'StrikethroughMark' },
  '`': { node: 'InlineCode', mark: 'CodeMark' },
} as const;

type InlineMarker = keyof typeof SPANS;
type Span = (typeof SPANS)[InlineMarker];
type TextRange = { from: number; to: number };

const WORD_CHAR = /[\p{L}\p{M}\p{N}_]/u;
const BLOCK_PREFIX = /^\s*(?:(?:[-*+]|\d+[.)])\s+|>\s?|#{1,6}\s+)*/;

const spanFor = (prefix: string): Span | undefined => SPANS[prefix as InlineMarker];
const isWordChar = (char: string | undefined) => char !== undefined && WORD_CHAR.test(char);

function enclosingSpan(state: EditorState, range: TextRange, span: Span): SyntaxNode | null {
  const tree = treeUpTo(state, range.to);
  for (const side of [1, -1] as const) {
    for (let node: SyntaxNode | null = tree.resolveInner(range.from, side); node; node = node.parent) {
      if (node.name === span.node && node.from <= range.from && node.to >= range.to) return node;
    }
  }
  return null;
}

function spansInside(state: EditorState, range: TextRange, span: Span): SyntaxNode[] {
  const found: SyntaxNode[] = [];
  treeUpTo(state, range.to).iterate({
    from: range.from,
    to: range.to,
    enter: (ref) => {
      if (ref.name !== span.node) return;
      if (ref.from < range.to && ref.to > range.from) found.push(ref.node);
      return false;
    },
  });
  return found;
}

function markChanges(node: SyntaxNode, span: Span): ChangeSpec[] {
  const open = node.firstChild;
  const close = node.lastChild;
  if (!open || !close || open === close || open.name !== span.mark || close.name !== span.mark) return [];
  return [{ from: open.from, to: open.to }, { from: close.from, to: close.to }];
}

function wordAt(state: EditorState, pos: number): TextRange | null {
  const line = state.doc.lineAt(pos);
  let start = pos - line.from;
  let end = start;
  while (start > 0 && isWordChar(line.text[start - 1])) start--;
  while (end < line.length && isWordChar(line.text[end])) end++;
  return start === end ? null : { from: line.from + start, to: line.from + end };
}

// One range per selected line, without block markers or surrounding whitespace.
function selectedSegments(state: EditorState, from: number, to: number): TextRange[] {
  const segments: TextRange[] = [];
  const last = state.doc.lineAt(to).number;
  for (let n = state.doc.lineAt(from).number; n <= last; n++) {
    const line = state.doc.line(n);
    const start = Math.max(from, line.from + BLOCK_PREFIX.exec(line.text)![0].length);
    const end = Math.min(to, line.to);
    const text = state.sliceDoc(start, end);
    const trimmedFrom = start + text.length - text.trimStart().length;
    const trimmedTo = end - (text.length - text.trimEnd().length);
    if (trimmedFrom < trimmedTo) segments.push({ from: trimmedFrom, to: trimmedTo });
  }
  return segments;
}

function isTextWrapped(state: EditorState, range: TextRange, prefix: string, suffix: string): boolean {
  const text = state.sliceDoc(range.from, range.to);
  return text.length > prefix.length + suffix.length && text.startsWith(prefix) && text.endsWith(suffix);
}

function toggleInline(view: EditorView, prefix: string, suffix: string, placeholder: string): void {
  const { state } = view;
  const main = state.selection.main;
  const span = spanFor(prefix);

  let segments: TextRange[];
  let word: TextRange | null = null;
  if (main.empty) {
    if (span && enclosingSpan(state, main, span)) segments = [main];
    else {
      word = wordAt(state, main.head);
      segments = word ? [word] : [];
    }
  } else {
    segments = selectedSegments(state, main.from, main.to);
  }

  if (segments.length === 0) {
    const insert = prefix + placeholder + suffix;
    const at = main.empty ? main.head : main.to;
    view.dispatch({
      changes: { from: at, insert },
      selection: EditorSelection.single(at + prefix.length, at + prefix.length + placeholder.length),
    });
    return;
  }

  const enclosing = segments.map((range) => (span ? enclosingSpan(state, range, span) : null));
  const allWrapped = span
    ? enclosing.every(Boolean)
    : segments.every((range) => isTextWrapped(state, range, prefix, suffix));

  if (allWrapped) {
    const changes = span
      ? [...new Map(enclosing.map((node) => [node!.from, node!])).values()].flatMap((node) => markChanges(node, span))
      : segments.flatMap((range) => [
          { from: range.from, to: range.from + prefix.length },
          { from: range.to - suffix.length, to: range.to },
        ]);
    view.dispatch({ changes });
    return;
  }

  const changes: ChangeSpec[] = [];
  const merged = new Set<number>();
  segments.forEach((range, i) => {
    if (enclosing[i]) return;
    let { from, to } = range;
    if (span) {
      for (const node of spansInside(state, range, span)) {
        if (merged.has(node.from)) continue;
        merged.add(node.from);
        changes.push(...markChanges(node, span));
        from = Math.min(from, node.from);
        to = Math.max(to, node.to);
      }
    }
    // `_` inside a word is literal text, so emphasis there needs `*`.
    const intraWord = prefix === '_' && (isWordChar(state.sliceDoc(from - 1, from)) || isWordChar(state.sliceDoc(to, to + 1)));
    changes.push({ from, insert: intraWord ? '*' : prefix }, { from: to, insert: intraWord ? '*' : suffix });
  });

  const changeSet = state.changes(changes);
  let selection: EditorSelection;
  if (word) {
    selection = EditorSelection.single(changeSet.mapPos(main.head, main.head === word.to ? -1 : 1));
  } else {
    const start = changeSet.mapPos(segments[0].from, 1);
    const end = changeSet.mapPos(segments[segments.length - 1].to, -1);
    selection = main.anchor > main.head ? EditorSelection.single(end, start) : EditorSelection.single(start, end);
  }
  view.dispatch({ changes: changeSet, selection });
}

function wrapBlock(view: EditorView, prefix: string, suffix: string, placeholder: string): void {
  const { from, to } = view.state.selection.main;
  const text = view.state.sliceDoc(from, to) || placeholder;
  view.dispatch({
    changes: { from, to, insert: prefix + text + suffix },
    selection: EditorSelection.single(from + prefix.length, from + prefix.length + text.length),
  });
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toggleLinePrefix(view: EditorView, linePrefix: string): void {
  const { state } = view;
  const { from, to } = state.selection.main;
  const firstLine = state.doc.lineAt(from).number;
  let lastLine = state.doc.lineAt(to).number;
  if (to > from && to === state.doc.line(lastLine).from && lastLine > firstLine) lastLine--;

  const lines = [];
  for (let n = firstLine; n <= lastLine; n++) lines.push(state.doc.line(n));
  const targets = lines.length === 1 ? lines : lines.filter((line) => line.text.trim() !== '');

  const numbered = /^\d+\.\s/.test(linePrefix);
  const ownPrefix = numbered ? /^\d+\.\s/ : new RegExp(`^${escapeRegExp(linePrefix)}`);
  const parsed = targets.map((line) => {
    const indent = /^\s*/.exec(line.text)![0];
    return { start: line.from + indent.length, indent: indent.length, rest: line.text.slice(indent.length) };
  });
  const allHavePrefix = parsed.every(({ rest }) => ownPrefix.test(rest));

  const counters = new Map<number, number>();
  const changes: ChangeSpec[] = [];
  for (const { start, indent, rest } of parsed) {
    if (allHavePrefix) {
      changes.push({ from: start, to: start + ownPrefix.exec(rest)![0].length });
      continue;
    }
    for (const level of counters.keys()) if (level > indent) counters.delete(level);
    const number = (counters.get(indent) ?? 0) + 1;
    counters.set(indent, number);
    if (ownPrefix.test(rest)) continue;
    const replaced = /^(?:#{1,6}\s|-\s|\d+\.\s)/.exec(rest)?.[0] ?? '';
    changes.push({ from: start, to: start + replaced.length, insert: numbered ? `${number}. ` : linePrefix });
  }

  const changeSet = state.changes(changes);
  view.dispatch({ changes: changeSet, selection: state.selection.map(changeSet, 1) });
}

function applyMarkdownFormat(
  view: EditorView | null,
  action: FormatAction
): void {
  if (!view) return;

  if (action.prefix && action.suffix) {
    const placeholder = action.placeholder ?? '';
    if (action.prefix.includes('\n')) wrapBlock(view, action.prefix, action.suffix, placeholder);
    else toggleInline(view, action.prefix, action.suffix, placeholder);
  } else if (action.linePrefix) {
    toggleLinePrefix(view, action.linePrefix);
  }
  view.focus();
}

export function hasFormat(view: EditorView | null, marker: InlineMarker): boolean {
  if (!view) return false;
  const { state } = view;
  const main = state.selection.main;
  const span = SPANS[marker];
  const segments = main.empty ? [main] : selectedSegments(state, main.from, main.to);
  return segments.length > 0 && segments.every((range) => enclosingSpan(state, range, span));
}

function hasLineFormat(view: EditorView | null, linePrefix: string): boolean {
  if (!view) return false;

  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  const lineText = line.text;

  const match = lineText.match(/^\s*(.*)/);
  const textAfterWhitespace = match ? match[1] : lineText;

  return textAfterWhitespace.startsWith(linePrefix);
}

export function hasBlockquote(view: EditorView | null): boolean {
  return hasLineFormat(view, '> ');
}

export function hasBulletList(view: EditorView | null): boolean {
  return hasLineFormat(view, '- ');
}

export function hasNumberedList(view: EditorView | null): boolean {
  if (!view) return false;
  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  const match = line.text.match(/^\s*(.*)/);
  const textAfterWhitespace = match ? match[1] : line.text;
  return /^\d+\.\s/.test(textAfterWhitespace);
}

export function hasHeading(view: EditorView | null): boolean {
  if (!view) return false;
  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  return /^\s*#{1,6}\s/.test(line.text);
}

export function getHeadingLevel(view: EditorView | null): number {
  if (!view) return 0;
  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  const match = line.text.match(/^\s*(#{1,6})\s/);
  return match ? match[1].length : 0;
}

export const formats = {
  bold: (view: EditorView | null) =>
    applyMarkdownFormat(view, { prefix: '**', suffix: '**', placeholder: 'bold text' }),

  italic: (view: EditorView | null) =>
    applyMarkdownFormat(view, { prefix: '_', suffix: '_', placeholder: 'italic text' }),

  strikethrough: (view: EditorView | null) =>
    applyMarkdownFormat(view, { prefix: '~~', suffix: '~~', placeholder: 'strikethrough text' }),

  inlineCode: (view: EditorView | null) =>
    applyMarkdownFormat(view, { prefix: '`', suffix: '`', placeholder: 'code' }),

  heading1: (view: EditorView | null) =>
    applyMarkdownFormat(view, { linePrefix: '# ' }),

  heading2: (view: EditorView | null) =>
    applyMarkdownFormat(view, { linePrefix: '## ' }),

  heading3: (view: EditorView | null) =>
    applyMarkdownFormat(view, { linePrefix: '### ' }),

  link: (view: EditorView | null) =>
    applyMarkdownFormat(view, { prefix: '[', suffix: '](url)', placeholder: 'link text' }),

  blockquote: (view: EditorView | null) =>
    applyMarkdownFormat(view, { linePrefix: '> ' }),

  bulletList: (view: EditorView | null) =>
    applyMarkdownFormat(view, { linePrefix: '- ' }),

  numberedList: (view: EditorView | null) =>
    applyMarkdownFormat(view, { linePrefix: '1. ' }),

  codeBlock: (view: EditorView | null) =>
    applyMarkdownFormat(view, { prefix: '```\n', suffix: '\n```', placeholder: 'code' }),

  table: (view: EditorView | null, rows: number, cols: number) => {
    if (!view) return;

    const headerCells = Array(cols).fill('Header').map((h, i) => ` ${h} ${i + 1} `);
    const headerRow = `|${headerCells.join('|')}|`;

    const separatorCells = Array(cols).fill('--------');
    const separatorRow = `|${separatorCells.join('|')}|`;

    const dataCells = Array(cols).fill('        ');
    const dataRows = Array(rows - 1).fill(`|${dataCells.join('|')}|`).join('\n');

    const table = `${headerRow}\n${separatorRow}\n${dataRows}\n`;

    const { from } = view.state.selection.main;
    const line = view.state.doc.lineAt(from);

    const prefix = from > line.from ? '\n' : '';

    view.dispatch({
      changes: { from, to: from, insert: `${prefix}${table}` },
      selection: {
        anchor: from + prefix.length + 2,
        head: from + prefix.length + 2
      }
    });
    view.focus();
  },

  comment: (view: EditorView | null) =>
    applyMarkdownFormat(view, { prefix: '<!-- ', suffix: ' -->', placeholder: 'comment' }),
};
