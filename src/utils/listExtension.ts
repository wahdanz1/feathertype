import { keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { treeUpTo } from './markdownSyntax';

function handleEnterInList(view: EditorView): boolean {
  const { state } = view;
  const { from, to } = state.selection.main;

  if (from !== to) return false;

  const line = state.doc.lineAt(from);
  const lineText = line.text;

  const bulletMatch = lineText.match(/^(\s*)-\s*$/);
  const numberedMatch = lineText.match(/^(\s*)\d+\.\s*$/);

  if (!bulletMatch && !numberedMatch) return false;

  const indent = bulletMatch ? bulletMatch[1] : (numberedMatch ? numberedMatch[1] : '');

  // A lone `-` can also be a setext underline or code; only real list markers count.
  const markerPos = line.from + indent.length;
  if (treeUpTo(state, line.to).resolveInner(markerPos, 1).name !== 'ListMark') return false;

  // Clear the empty item in place — prevents the "dash moving" bug
  view.dispatch({
    changes: {
      from: line.from,
      to: line.to,
      insert: indent
    },
    selection: {
      anchor: line.from + indent.length,
      head: line.from + indent.length
    }
  });

  return true;
}

export const listExtension = Prec.highest(keymap.of([
  {
    key: 'Enter',
    run: handleEnterInList
  }
]));
