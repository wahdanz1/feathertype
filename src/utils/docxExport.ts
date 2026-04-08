/**
 * Converts markdown to a DOCX ArrayBuffer using the docx library
 * This replaces the previous remark-docx implementation with full styling control
 */

import { markdownToDocxBuffer as convertMarkdownToDocx } from './docx';
import type { DocxConfig } from './docx';

/**
 * Converts markdown to a DOCX ArrayBuffer.
 * Heading mapping: # → Heading 1, ## → Heading 2, ### → Heading 3
 *
 * @param markdown - The markdown content to convert
 * @param config - Optional configuration for fonts, spacing, and table styling
 */
export async function markdownToDocxBuffer(
  markdown: string,
  config?: Partial<DocxConfig>
): Promise<ArrayBuffer> {
  return convertMarkdownToDocx(markdown, config);
}
