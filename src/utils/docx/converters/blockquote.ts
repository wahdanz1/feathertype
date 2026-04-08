/**
 * Converts blockquote markdown nodes to docx Paragraph objects
 */

import { Paragraph, BorderStyle } from 'docx';
import type { Blockquote, Paragraph as MdParagraph } from 'mdast';
import type { ConverterContext } from './types';
import { convertInlineNodes } from './text';

/**
 * Convert a markdown blockquote to docx Paragraphs with left border
 */
export function convertBlockquote(
  node: Blockquote,
  ctx: ConverterContext
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const child of node.children) {
    if (child.type === 'paragraph') {
      const children = convertInlineNodes((child as MdParagraph).children, ctx);

      paragraphs.push(
        new Paragraph({
          children,
          spacing: {
            line: ctx.config.spacing.line,
            before: 80,
            after: 80,
          },
          indent: {
            left: 720, // Indent blockquotes
          },
          border: {
            left: {
              color: 'CCCCCC',
              space: 8,
              style: BorderStyle.SINGLE,
              size: 12,
            },
          },
        })
      );
    }
  }

  return paragraphs;
}
