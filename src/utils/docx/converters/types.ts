/**
 * Shared types for docx converters
 */

import type { Paragraph, Table, TableOfContents } from 'docx';
import type { DocxConfig } from '../config';

/**
 * Content that can be added to a docx document section
 */
export type DocxContent = Paragraph | Table | TableOfContents;

/**
 * Context passed to all converters
 */
export interface ConverterContext {
  config: DocxConfig;
}
