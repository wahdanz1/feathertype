/**
 * Main converter that orchestrates all markdown-to-docx conversions
 */

import type { Content } from 'mdast';
import type { DocxContent, ConverterContext } from './types';
import { convertParagraph } from './paragraph';
import { convertHeading } from './heading';
import { convertList } from './list';
import { convertTable } from './table';
import { convertCodeBlock } from './code';
import { convertBlockquote } from './blockquote';

/**
 * Convert a markdown AST node to docx content
 */
export function convertNode(
  node: Content,
  ctx: ConverterContext
): DocxContent[] {
  switch (node.type) {
    case 'paragraph':
      return [convertParagraph(node, ctx)];

    case 'heading':
      return [convertHeading(node, ctx)];

    case 'list':
      return convertList(node, ctx);

    case 'table':
      return [convertTable(node, ctx)];

    case 'code':
      return [convertCodeBlock(node, ctx)];

    case 'blockquote':
      return convertBlockquote(node, ctx);

    case 'thematicBreak':
      // Horizontal rule - we'll skip for now or add a simple line
      return [];

    default:
      // Unsupported node type - skip
      console.warn(`Unsupported markdown node type: ${node.type}`);
      return [];
  }
}

/**
 * Convert all children nodes to docx content
 */
export function convertNodes(
  nodes: Content[],
  ctx: ConverterContext
): DocxContent[] {
  const result: DocxContent[] = [];

  for (const node of nodes) {
    result.push(...convertNode(node, ctx));
  }

  return result;
}
