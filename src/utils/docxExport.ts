import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDocx from 'remark-docx';
import type { Root, Heading } from 'mdast';
import { visit } from 'unist-util-visit';

// Shifts all heading depths by +1 so # → Heading 1, ## → Heading 2, etc.
// (remark-docx maps depth 1 to Word's "Title" style by default)
function shiftHeadingsPlugin() {
  return (tree: Root) => {
    visit(tree, 'heading', (node: Heading) => {
      node.depth = Math.min(node.depth + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6;
    });
  };
}

/**
 * Converts markdown to a DOCX ArrayBuffer.
 * Heading mapping: # → Heading 1, ## → Heading 2, ### → Heading 3
 */
export async function markdownToDocxBuffer(markdown: string): Promise<ArrayBuffer> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(shiftHeadingsPlugin)
    .use(remarkDocx, { spacing: 160 });

  const doc = await processor.process(markdown);
  return await (doc.result as Promise<ArrayBuffer>);
}
