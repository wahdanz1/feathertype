/**
 * Main document builder - converts markdown to a docx Document
 */

import {
  Document,
  Packer,
  AlignmentType,
  LevelFormat,
} from 'docx';
import type { DocxConfig } from './config';
import { DEFAULT_CONFIG } from './config';
import { parseMarkdown } from './parser';
import { convertNodes } from './converters';

/**
 * Convert markdown string to a docx Document
 */
export async function markdownToDocx(
  markdown: string,
  config: Partial<DocxConfig> = {}
): Promise<Document> {
  // Merge user config with defaults
  const fullConfig: DocxConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    font: { ...DEFAULT_CONFIG.font, ...config.font },
    spacing: { ...DEFAULT_CONFIG.spacing, ...config.spacing },
    table: {
      cellMargins: {
        ...DEFAULT_CONFIG.table.cellMargins,
        ...config.table?.cellMargins,
      },
    },
  };

  // Parse markdown to AST
  const ast = await parseMarkdown(markdown);

  // Convert AST to docx content
  const content = convertNodes(ast.children, { config: fullConfig });

  // Create the document
  const doc = new Document({
    sections: [
      {
        children: content,
      },
    ],
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.START,
            },
            {
              level: 1,
              format: LevelFormat.LOWER_LETTER,
              text: '%2.',
              alignment: AlignmentType.START,
            },
            {
              level: 2,
              format: LevelFormat.LOWER_ROMAN,
              text: '%3.',
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
  });

  return doc;
}

/**
 * Convert markdown string to a docx ArrayBuffer (ready for file writing)
 */
export async function markdownToDocxBuffer(
  markdown: string,
  config?: Partial<DocxConfig>
): Promise<ArrayBuffer> {
  const doc = await markdownToDocx(markdown, config);
  const buffer = await Packer.toBuffer(doc);
  return buffer.buffer;
}
