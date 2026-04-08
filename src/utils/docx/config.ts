/**
 * Configuration for .docx export
 * Centralizes all styling and formatting options
 */

export interface DocxConfig {
  // Font settings
  font: {
    family: string;
    size: number; // in half-points (e.g., 22 = 11pt)
  };

  // Spacing settings
  spacing: {
    line: number; // in twips (1/20th of a point, e.g., 276 = 1.15 line spacing)
    before: number; // paragraph spacing before, in twips
    after: number; // paragraph spacing after, in twips
  };

  // Table settings
  table: {
    cellMargins: {
      top: number;    // in twips
      bottom: number; // in twips
      left: number;   // in twips
      right: number;  // in twips
    };
  };
}

/**
 * Default configuration matching Microsoft Word defaults
 */
export const DEFAULT_CONFIG: DocxConfig = {
  font: {
    family: 'Calibri',
    size: 22, // 11pt
  },
  spacing: {
    line: 276, // 1.15 line spacing (Word default)
    before: 0,
    after: 160, // 8pt after paragraphs (Word default)
  },
  table: {
    cellMargins: {
      top: 0,
      bottom: 0,
      left: 108, // ~0.08" (Word default)
      right: 108,
    },
  },
};

/**
 * Common font options for user selection
 */
export const FONT_OPTIONS = [
  'Calibri',
  'Arial',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Cambria',
  'Garamond',
] as const;

export type FontOption = typeof FONT_OPTIONS[number];
