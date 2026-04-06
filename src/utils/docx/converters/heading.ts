/**
 * Converts heading markdown nodes to docx Paragraph objects with heading styles
 */

import { Paragraph, HeadingLevel } from 'docx';
import type { Heading } from 'mdast';
import type { ConverterContext } from './types';
import { convertInlineNodes } from './text';

/**
 * Convert a markdown heading to a docx Paragraph with heading style
 */
export function convertHeading(
  node: Heading,
  ctx: ConverterContext
): Paragraph {
  const children = convertInlineNodes(node.children, ctx);

  // Map markdown heading depth (1-6) to docx HeadingLevel
  const headingLevel = getHeadingLevel(node.depth);

  return new Paragraph({
    children,
    heading: headingLevel,
    spacing: {
      before: 240, // 12pt before headings
      after: 120,  // 6pt after headings
    },
  });
}

/**
 * Map markdown heading depth to docx HeadingLevel
 */
function getHeadingLevel(depth: number): typeof HeadingLevel[keyof typeof HeadingLevel] {
  switch (depth) {
    case 1: return HeadingLevel.HEADING_1;
    case 2: return HeadingLevel.HEADING_2;
    case 3: return HeadingLevel.HEADING_3;
    case 4: return HeadingLevel.HEADING_4;
    case 5: return HeadingLevel.HEADING_5;
    case 6: return HeadingLevel.HEADING_6;
    default: return HeadingLevel.HEADING_1;
  }
}
