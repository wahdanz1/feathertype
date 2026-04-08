/**
 * Markdown parser using unified/remark
 * Parses markdown into an AST that we can convert to docx
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Root } from 'mdast';

/**
 * Parse markdown string into an AST (Abstract Syntax Tree)
 */
export async function parseMarkdown(markdown: string): Promise<Root> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm); // GitHub Flavored Markdown (tables, strikethrough, etc.)

  const tree = processor.parse(markdown);
  return tree as Root;
}
