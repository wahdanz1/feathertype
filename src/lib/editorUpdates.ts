import { EditorView, type ViewUpdate } from '@codemirror/view';

type Listener = (update: ViewUpdate) => void;

const listeners = new Set<Listener>();

export const editorUpdates = EditorView.updateListener.of((update) => {
  if (!update.docChanged && !update.selectionSet) return;
  listeners.forEach((listener) => listener(update));
});

export function subscribeEditorUpdates(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
