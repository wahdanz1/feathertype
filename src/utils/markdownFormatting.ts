import type { EditorView } from '@codemirror/view';

export interface FormatAction {
  prefix?: string;      // e.g., "**" for bold
  suffix?: string;      // e.g., "**" for bold
  linePrefix?: string;  // e.g., "# " for heading
  placeholder?: string; // text when nothing selected
}

export function applyMarkdownFormat(
  view: EditorView | null,
  action: FormatAction
): void {
  if (!view) return;

  const { from, to } = view.state.selection.main;
  const selectedText = view.state.sliceDoc(from, to);

  // For inline formats (bold, italic, code)
  if (action.prefix && action.suffix) {
    // Check if text is already wrapped with this format
    const isWrapped = selectedText.startsWith(action.prefix) && selectedText.endsWith(action.suffix);

    if (isWrapped) {
      // Remove the formatting (unwrap)
      const unwrapped = selectedText.slice(action.prefix.length, -action.suffix.length);
      view.dispatch({
        changes: { from, to, insert: unwrapped },
        selection: {
          anchor: from,
          head: from + unwrapped.length
        }
      });
    } else {
      // Add the formatting (wrap) and SELECT THE ENTIRE FORMATTED TEXT
      const text = selectedText || action.placeholder || '';
      const formatted = `${action.prefix}${text}${action.suffix}`;
      view.dispatch({
        changes: { from, to, insert: formatted },
        selection: {
          anchor: from,
          head: from + formatted.length  // Select entire formatted text including markers
        }
      });
    }
    view.focus();
  }

  // For line formats (headings, lists)
  if (action.linePrefix) {
    // Get all lines in the selection
    const startLine = view.state.doc.lineAt(from);
    const endLine = view.state.doc.lineAt(to);

    const changes = [];
    let allLinesHavePrefix = true;
    const isNumberedList = action.linePrefix.match(/^\d+\.\s/);

    // Check all lines in the selection
    for (let pos = startLine.from; pos <= endLine.from;) {
      const line = view.state.doc.lineAt(pos);

      // Extract leading whitespace and text after it
      const match = line.text.match(/^(\s*)(.*)/);
      const indent = match ? match[1] : '';
      const textAfterWhitespace = match ? match[2] : line.text;

      // For numbered lists: indented items should use bullets, non-indented use numbers
      const hasPrefix = isNumberedList
        ? (indent.length > 0 ? /^-\s/.test(textAfterWhitespace) : /^\d+\.\s/.test(textAfterWhitespace))
        : textAfterWhitespace.startsWith(action.linePrefix);

      if (!hasPrefix) {
        allLinesHavePrefix = false;
      }
      pos = line.to + 1; // Move to next line
    }

    // Apply changes to all lines (preserving indentation)
    let lineNumber = 1;
    for (let pos = startLine.from; pos <= endLine.from;) {
      const line = view.state.doc.lineAt(pos);
      const lineText = line.text;

      // Extract leading whitespace and text after it
      const match = lineText.match(/^(\s*)(.*)/);
      const indent = match ? match[1] : '';
      const textAfterWhitespace = match ? match[2] : lineText;

      if (allLinesHavePrefix) {
        // Remove the prefix from all lines (toggle off), normalizing indentation
        let withoutPrefix: string;
        if (isNumberedList) {
          // Remove either number or bullet depending on indentation
          withoutPrefix = indent.length > 0
            ? textAfterWhitespace.replace(/^-\s/, '')
            : textAfterWhitespace.replace(/^\d+\.\s/, '');
        } else {
          withoutPrefix = textAfterWhitespace.replace(new RegExp(`^${action.linePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), '');
        }

        // Normalize indentation to 4-space increments
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
        // Add prefix to lines that don't have it, normalizing indentation
        const hasPrefix = isNumberedList
          ? (indent.length > 0 ? /^-\s/.test(textAfterWhitespace) : /^\d+\.\s/.test(textAfterWhitespace))
          : textAfterWhitespace.startsWith(action.linePrefix);

        if (!hasPrefix) {
          // Remove any existing heading/list markers first, then add new prefix
          const cleanText = textAfterWhitespace.replace(/^#{1,6}\s|^-\s|^\d+\.\s/, '');

          // Normalize indentation to 4-space increments for markdown compatibility
          let normalizedIndent = indent;
          if (indent.length > 0) {
            // Round up to nearest multiple of 4 spaces, with minimum of 4
            const indentLevel = Math.max(1, Math.ceil(indent.length / 4));
            normalizedIndent = ' '.repeat(indentLevel * 4);
          }

          // For numbered lists: use bullets for indented items, numbers for top-level
          let prefix: string;
          if (isNumberedList && indent.length > 0) {
            prefix = '- '; // Use bullets for indented items
          } else if (isNumberedList) {
            prefix = `${lineNumber}. `; // Use numbers for top-level items
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
          // Still increment line number for top-level items that already have prefix
          lineNumber++;
        }
      }

      pos = line.to + 1; // Move to next line
    }

    if (changes.length > 0) {
      view.dispatch({ changes });
    }
    view.focus();
  }
}

// Check if current selection has a specific format
export function hasFormat(view: EditorView | null, prefix: string, suffix: string): boolean {
  if (!view) return false;

  const { from, to } = view.state.selection.main;
  const selectedText = view.state.sliceDoc(from, to);

  return selectedText.startsWith(prefix) && selectedText.endsWith(suffix) && selectedText.length > prefix.length + suffix.length;
}

// Check if current line has a specific line prefix (for lists, headings)
export function hasLineFormat(view: EditorView | null, linePrefix: string): boolean {
  if (!view) return false;

  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  const lineText = line.text;

  // Extract text after leading whitespace
  const match = lineText.match(/^\s*(.*)/);
  const textAfterWhitespace = match ? match[1] : lineText;

  return textAfterWhitespace.startsWith(linePrefix);
}

// Check if current line is a bullet list
export function hasBulletList(view: EditorView | null): boolean {
  return hasLineFormat(view, '- ');
}

// Check if current line is a numbered list
export function hasNumberedList(view: EditorView | null): boolean {
  if (!view) return false;
  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  const match = line.text.match(/^\s*(.*)/);
  const textAfterWhitespace = match ? match[1] : line.text;
  return /^\d+\.\s/.test(textAfterWhitespace);
}

// Check if current line is a heading (any level)
export function hasHeading(view: EditorView | null): boolean {
  if (!view) return false;
  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  return /^\s*#{1,6}\s/.test(line.text);
}

// Pre-configured format actions
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

    // Generate markdown table
    const headerCells = Array(cols).fill('Header').map((h, i) => ` ${h} ${i + 1} `);
    const headerRow = `|${headerCells.join('|')}|`;

    const separatorCells = Array(cols).fill('--------');
    const separatorRow = `|${separatorCells.join('|')}|`;

    const dataCells = Array(cols).fill('        ');
    const dataRows = Array(rows - 1).fill(`|${dataCells.join('|')}|`).join('\n');

    const table = `${headerRow}\n${separatorRow}\n${dataRows}\n`;

    // Insert at cursor
    const { from } = view.state.selection.main;
    const line = view.state.doc.lineAt(from);

    // If not at start of line, add newline before table
    const prefix = from > line.from ? '\n' : '';

    view.dispatch({
      changes: { from, to: from, insert: `${prefix}${table}` },
      selection: {
        // Position cursor in first header cell (after "| ")
        anchor: from + prefix.length + 2,
        head: from + prefix.length + 2
      }
    });
    view.focus();
  },
};
