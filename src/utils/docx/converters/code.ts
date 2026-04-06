/**
 * Converts code block markdown nodes to docx Paragraph objects
 */

import { Paragraph, TextRun, ShadingType } from 'docx';
import type { Code } from 'mdast';
import type { ConverterContext } from './types';

/**
 * Convert a markdown code block to a docx Paragraph with monospace font
 */
export function convertCodeBlock(
  node: Code,
  _ctx: ConverterContext
): Paragraph {
  // Split code into lines
  const lines = node.value.split('\n');

  // Create a text run for each line with line breaks
  const children = lines.map((line, index) => {
    return new TextRun({
      text: line,
      font: 'Consolas',
      size: 20, // 10pt
      break: index > 0 ? 1 : 0, // Line break before all lines except first
    });
  });

  return new Paragraph({
    children,
    shading: {
      type: ShadingType.SOLID,
      color: 'F5F5F5', // Light gray background
    },
    spacing: {
      before: 120,
      after: 120,
      line: 240, // Single spacing for code blocks
    },
    indent: {
      left: 360, // Indent code blocks slightly
    },
  });
}
