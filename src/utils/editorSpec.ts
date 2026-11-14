import { EditorSelection, EditorState } from '@codemirror/state';
import { EditorView, keymap, runScopeHandlers } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { listExtension } from './listExtension';
import { tableExtension } from './tableExtension';
import { markdownSupport } from './markdownSyntax';

// Specs mark the cursor with ‸ and a selection with «…» (anchor at «).
const CURSOR = '‸';
const OPEN = '«';
const CLOSE = '»';

export function parseSpec(spec: string): { doc: string; anchor: number; head: number } {
  const cursor = spec.indexOf(CURSOR);
  if (cursor >= 0) return { doc: spec.replace(CURSOR, ''), anchor: cursor, head: cursor };
  const open = spec.indexOf(OPEN);
  const close = spec.indexOf(CLOSE);
  if (open < 0 || close < open) throw new Error(`spec has no cursor or selection: ${spec}`);
  return { doc: spec.replace(OPEN, '').replace(CLOSE, ''), anchor: open, head: close - 1 };
}

export function printSpec(state: EditorState): string {
  const { from, to } = state.selection.main;
  const doc = state.doc.toString();
  if (from === to) return doc.slice(0, from) + CURSOR + doc.slice(from);
  return doc.slice(0, from) + OPEN + doc.slice(from, to) + CLOSE + doc.slice(to);
}

// Same language and Enter handlers as the app's editor.
export function createView(spec: string): EditorView {
  const { doc, anchor, head } = parseSpec(spec);
  return new EditorView({
    parent: document.body,
    state: EditorState.create({
      doc,
      selection: EditorSelection.single(anchor, head),
      extensions: [markdownSupport, listExtension, tableExtension, keymap.of(defaultKeymap)],
    }),
  });
}

export function pressEnter(view: EditorView): void {
  runScopeHandlers(view, new KeyboardEvent('keydown', { key: 'Enter' }), 'editor');
}
