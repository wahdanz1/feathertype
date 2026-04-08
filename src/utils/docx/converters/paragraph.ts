/**
 * Converts paragraph markdown nodes to docx Paragraph objects
 */

import { Paragraph } from 'docx';
import type { Paragraph as MdParagraph } from 'mdast';
import type { ConverterContext } from './types';
import { convertInlineNodes } from './text';

/**
 * Convert a markdown paragraph to a docx Paragraph
 */
export function convertParagraph(
  node: MdParagraph,
  ctx: ConverterContext
): Paragraph {
  const children = convertInlineNodes(node.children, ctx);

  return new Paragraph({
    children,
    spacing: {
      line: ctx.config.spacing.line,
      before: ctx.config.spacing.before,
      after: ctx.config.spacing.after,
    },
  });
}
