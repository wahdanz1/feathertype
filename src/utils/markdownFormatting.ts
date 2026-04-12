import type { EditorView } from '@codemirror/view';

export interface FormatAction {
  prefix?: string;      // e.g., "**" for bold
  suffix?: string;      // e.g., "**" for bold
  linePrefix?: string;  // e.g., "# " for heading
  placeholder?: string; // text when nothing selected
}

function getWordAtCursor(view: EditorView, from: number, to: number): { start: number; end: number; text: string } | null {
  if (from !== to) return null;

  const line = view.state.doc.lineAt(from);
  const lineText = line.text;
  const cursorPosInLine = from - line.from;

  const charBefore = cursorPosInLine > 0 ? lineText[cursorPosInLine - 1] : ' ';
  const charAfter = cursorPosInLine < lineText.length ? lineText[cursorPosInLine] : ' ';

  if (!/\w/.test(charBefore) && !/\w/.test(charAfter)) {
    return null;
  }

  let wordStart = cursorPosInLine;
  while (wordStart > 0 && /\w/.test(lineText[wordStart - 1])) {
    wordStart--;
  }

  let wordEnd = cursorPosInLine;
  while (wordEnd < lineText.length && /\w/.test(lineText[wordEnd])) {
    wordEnd++;
  }

  const docStart = line.from + wordStart;
  const docEnd = line.from + wordEnd;

  return {
    start: docStart,
    end: docEnd,
    text: lineText.substring(wordStart, wordEnd)
  };
}

export function applyMarkdownFormat(
  view: EditorView | null,
  action: FormatAction
): void {
  if (!view) return;

  let { from, to } = view.state.selection.main;
  let selectedText = view.state.sliceDoc(from, to);

  if (action.prefix && action.suffix) {
    if (from === to && hasFormat(view, action.prefix, action.suffix)) {
      const line = view.state.doc.lineAt(from);
      const lineText = line.text;
      const cursorPosInLine = from - line.from;

      const prefixPositions: number[] = [];
      for (let i = 0; i <= lineText.length - action.prefix.length; i++) {
        if (lineText.substring(i, i + action.prefix.length) === action.prefix) {
          prefixPositions.push(i);
        }
      }

      for (const prefixStart of prefixPositions) {
        for (let i = prefixStart + action.prefix.length; i <= lineText.length - action.suffix.length; i++) {
          if (lineText.substring(i, i + action.suffix.length) === action.suffix) {
            if (cursorPosInLine >= prefixStart && cursorPosInLine <= i + action.suffix.length) {
              const beforePrefix = lineText.substring(0, prefixStart);
              const content = lineText.substring(prefixStart + action.prefix.length, i);
              const afterSuffix = lineText.substring(i + action.suffix.length);
              const newLineText = beforePrefix + content + afterSuffix;

              let newCursorPos = cursorPosInLine;
              if (cursorPosInLine > prefixStart) {
                newCursorPos = Math.min(cursorPosInLine - action.prefix.length, beforePrefix.length + content.length);
              }

              view.dispatch({
                changes: { from: line.from, to: line.to, insert: newLineText },
                selection: {
                  anchor: line.from + newCursorPos,
                  head: line.from + newCursorPos
                }
              });
              view.focus();
              return;
            }
            break; // Found matching suffix for this prefix
          }
        }
      }
    }

    if (from === to) {
      const wordInfo = getWordAtCursor(view, from, to);
      if (wordInfo) {
        from = wordInfo.start;
        to = wordInfo.end;
        selectedText = wordInfo.text;
      }
    }
    const isWrapped = selectedText.startsWith(action.prefix) && selectedText.endsWith(action.suffix);

    if (isWrapped) {
      const unwrapped = selectedText.slice(action.prefix.length, -action.suffix.length);
      view.dispatch({
        changes: { from, to, insert: unwrapped },
        selection: {
          anchor: from,
          head: from + unwrapped.length
        }
      });
    } else {
      const text = selectedText || action.placeholder || '';
      const formatted = `${action.prefix}${text}${action.suffix}`;
      view.dispatch({
        changes: { from, to, insert: formatted },
        selection: {
          anchor: from,
          head: from + formatted.length
        }
      });
    }
    view.focus();
  }

  if (action.linePrefix) {
    const startLine = view.state.doc.lineAt(from);
    const endLine = view.state.doc.lineAt(to);

    const changes = [];
    let allLinesHavePrefix = true;
    const isNumberedList = action.linePrefix.match(/^\d+\.\s/);

    for (let pos = startLine.from; pos <= endLine.from;) {
      const line = view.state.doc.lineAt(pos);

      const match = line.text.match(/^(\s*)(.*)/);
      const indent = match ? match[1] : '';
      const textAfterWhitespace = match ? match[2] : line.text;

      const hasPrefix = isNumberedList
        ? (indent.length > 0 ? /^-\s/.test(textAfterWhitespace) : /^\d+\.\s/.test(textAfterWhitespace))
        : textAfterWhitespace.startsWith(action.linePrefix);

      if (!hasPrefix) {
        allLinesHavePrefix = false;
      }
      pos = line.to + 1;
    }

    let lineNumber = 1;
    for (let pos = startLine.from; pos <= endLine.from;) {
      const line = view.state.doc.lineAt(pos);
      const lineText = line.text;

      const match = lineText.match(/^(\s*)(.*)/);
      const indent = match ? match[1] : '';
      const textAfterWhitespace = match ? match[2] : lineText;

      if (allLinesHavePrefix) {
        let withoutPrefix: string;
        if (isNumberedList) {
          withoutPrefix = indent.length > 0
            ? textAfterWhitespace.replace(/^-\s/, '')
            : textAfterWhitespace.replace(/^\d+\.\s/, '');
        } else {
          withoutPrefix = textAfterWhitespace.replace(new RegExp(`^${action.linePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), '');
        }

        let normalizedIndent = indent;
        if (indent.length > 0) {
          const indentLevel = Math.max(1, Math.ceil(indent.length / 4));
          normalizedIndent = ' '.repeat(indentLevel * 4);
        }

        changes.push({
          from: line.from,
          to: line.to,
          insert: `${normalizedIndent}${withoutPrefix}`
        });
      } else {
        const hasPrefix = isNumberedList
          ? (indent.length > 0 ? /^-\s/.test(textAfterWhitespace) : /^\d+\.\s/.test(textAfterWhitespace))
          : textAfterWhitespace.startsWith(action.linePrefix);

        if (!hasPrefix) {
          const cleanText = textAfterWhitespace.replace(/^#{1,6}\s|^-\s|^\d+\.\s/, '');

          let normalizedIndent = indent;
          if (indent.length > 0) {
            const indentLevel = Math.max(1, Math.ceil(indent.length / 4));
            normalizedIndent = ' '.repeat(indentLevel * 4);
          }

          let prefix: string;
          if (isNumberedList && indent.length > 0) {
            prefix = '- ';
          } else if (isNumberedList) {
            prefix = `${lineNumber}. `;
            lineNumber++;
          } else {
            prefix = action.linePrefix;
          }

          changes.push({
            from: line.from,
            to: line.to,
            insert: `${normalizedIndent}${prefix}${cleanText}`
          });
        } else if (isNumberedList && indent.length === 0) {
          lineNumber++;
        }
      }

      pos = line.to + 1;
    }

    if (changes.length > 0) {
      view.dispatch({ changes });
    }
    view.focus();
  }
}

export function hasFormat(view: EditorView | null, prefix: string, suffix: string): boolean {
  if (!view) return false;

  const { from, to } = view.state.selection.main;

  if (from !== to) {
    const selectedText = view.state.sliceDoc(from, to);
    if (selectedText.startsWith(prefix) && selectedText.endsWith(suffix) && selectedText.length > prefix.length + suffix.length) {
      return true;
    }
  }

  const line = view.state.doc.lineAt(from);
  const lineText = line.text;
  const cursorPosInLine = from - line.from;

  const prefixPositions: number[] = [];
  for (let i = 0; i <= lineText.length - prefix.length; i++) {
    if (lineText.substring(i, i + prefix.length) === prefix) {
      prefixPositions.push(i);
    }
  }

  for (const prefixStart of prefixPositions) {
    for (let i = prefixStart + prefix.length; i <= lineText.length - suffix.length; i++) {
      if (lineText.substring(i, i + suffix.length) === suffix) {
        if (cursorPosInLine >= prefixStart && cursorPosInLine <= i + suffix.length) {
          return true;
        }
        break;
      }
    }
  }

  return false;
}

export function hasLineFormat(view: EditorView | null, linePrefix: string): boolean {
  if (!view) return false;

  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  const lineText = line.text;

  const match = lineText.match(/^\s*(.*)/);
  const textAfterWhitespace = match ? match[1] : lineText;

  return textAfterWhitespace.startsWith(linePrefix);
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
