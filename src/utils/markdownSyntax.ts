import { ensureSyntaxTree, syntaxTree } from '@codemirror/language';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import type { EditorState } from '@codemirror/state';

// GFM, so strikethrough and tables parse like the preview renders them.
export const markdownSupport = markdown({ base: markdownLanguage });

export type SyntaxTree = ReturnType<typeof syntaxTree>;
export type SyntaxNode = ReturnType<SyntaxTree['resolveInner']>;

export function treeUpTo(state: EditorState, pos: number): SyntaxTree {
  return ensureSyntaxTree(state, pos, 50) ?? syntaxTree(state);
}

export function isInCodeBlock(state: EditorState, pos: number): boolean {
  for (let node: SyntaxNode | null = treeUpTo(state, pos).resolveInner(pos, 1); node; node = node.parent) {
    if (node.name === 'FencedCode' || node.name === 'CodeBlock') return true;
  }
  return false;
}
