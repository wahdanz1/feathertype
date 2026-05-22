/**
 * Converts inline text nodes (bold, italic, code, links, etc.) to docx TextRun objects
 */

import { TextRun, ExternalHyperlink } from 'docx';
import type {
  PhrasingContent,
  Text,
  Strong,
  Emphasis,
  Delete,
  InlineCode,
  Link,
} from 'mdast';
import type { ConverterContext } from './types';

/**
 * Convert inline markdown nodes to docx TextRun or ExternalHyperlink
 */
export function convertInlineNodes(
  nodes: PhrasingContent[],
  ctx: ConverterContext,
  formatting: InlineFormatting = {}
): (TextRun | ExternalHyperlink)[] {
  const result: (TextRun | ExternalHyperlink)[] = [];

  for (const node of nodes) {
    result.push(...convertInlineNode(node, ctx, formatting));
  }

  return result;
}

/**
 * Convert a single inline node.
 *
 * Formatting (bold/italic/strike) accumulates as we recurse into nested marks
 * and is applied when we reach the leaf text — building a fresh TextRun from a
 * parent TextRun *instance* drops its text content.
 */
function convertInlineNode(
  node: PhrasingContent,
  ctx: ConverterContext,
  parentFormatting: InlineFormatting = {}
): (TextRun | ExternalHyperlink)[] {
  switch (node.type) {
    case 'text':
      return [createTextRun((node as Text).value, parentFormatting, ctx)];

    case 'strong':
      return convertInlineNodes((node as Strong).children, ctx, {
        ...parentFormatting,
        bold: true,
      });

    case 'emphasis':
      return convertInlineNodes((node as Emphasis).children, ctx, {
        ...parentFormatting,
        italics: true,
      });

    case 'delete':
      return convertInlineNodes((node as Delete).children, ctx, {
        ...parentFormatting,
        strike: true,
      });

    case 'inlineCode':
      return [
        new TextRun({
          text: (node as InlineCode).value,
          font: 'Consolas',
          size: 20, // 10pt
          shading: {
            type: 'solid',
            color: 'F0F0F0',
          },
          ...parentFormatting,
        }),
      ];

    case 'link': {
      const linkNode = node as Link;
      const children = convertInlineNodes(linkNode.children, ctx, parentFormatting);

      // Combine all text runs into a single hyperlink
      return [
        new ExternalHyperlink({
          link: linkNode.url,
          children: children.filter(child => child instanceof TextRun) as TextRun[],
        }),
      ];
    }

    case 'break':
      return [new TextRun({ text: '', break: 1 })];

    default:
      // Fallback for unhandled inline types
      if ('children' in node && Array.isArray(node.children)) {
        return convertInlineNodes(node.children as PhrasingContent[], ctx, parentFormatting);
      }
      return [];
  }
}

/**
 * Inline formatting options
 */
interface InlineFormatting {
  bold?: boolean;
  italics?: boolean;
  strike?: boolean;
}

/**
 * Create a TextRun with the given text and formatting
 */
function createTextRun(
  text: string,
  formatting: InlineFormatting,
  ctx: ConverterContext
): TextRun {
  return new TextRun({
    text,
    font: ctx.config.font.family,
    size: ctx.config.font.size,
    ...formatting,
  });
}
