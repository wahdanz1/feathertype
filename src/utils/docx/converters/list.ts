/**
 * Converts list markdown nodes (bullet/numbered) to docx Paragraph objects with list formatting
 */

import { Paragraph } from 'docx';
import type { List, ListItem } from 'mdast';
import type { ConverterContext } from './types';
import { convertInlineNodes } from './text';

/**
 * Convert a markdown list to docx Paragraphs with bullet/numbering
 */
export function convertList(
  node: List,
  ctx: ConverterContext
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const isOrdered = node.ordered === true;

  // Process each list item
  for (let i = 0; i < node.children.length; i++) {
    const item = node.children[i] as ListItem;
    paragraphs.push(...convertListItem(item, isOrdered, 0, ctx));
  }

  return paragraphs;
}

/**
 * Convert a single list item (may contain nested content)
 */
function convertListItem(
  item: ListItem,
  isOrdered: boolean,
  level: number,
  ctx: ConverterContext
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Process each child of the list item
  for (const child of item.children) {
    if (child.type === 'paragraph') {
      const children = convertInlineNodes(child.children, ctx);

      paragraphs.push(
        new Paragraph({
          children,
          bullet: isOrdered ? undefined : { level },
          numbering: isOrdered
            ? {
                reference: 'default-numbering',
                level,
              }
            : undefined,
          spacing: {
            before: 0,
            after: 0,
            line: ctx.config.spacing.line,
          },
        })
      );
    } else if (child.type === 'list') {
      // Nested list
      const nestedList = child as List;
      const nestedIsOrdered = nestedList.ordered === true;
      for (const nestedItem of nestedList.children) {
        paragraphs.push(
          ...convertListItem(nestedItem as ListItem, nestedIsOrdered, level + 1, ctx)
        );
      }
    }
  }

  return paragraphs;
}
