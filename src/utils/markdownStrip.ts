/**
 * Strip markdown syntax and return plain text content
 */
export function stripMarkdown(text: string): string {
  let result = text;

  // Remove code blocks first (```...```)
  result = result.replace(/```[\s\S]*?```/g, '');

  // Remove inline code (`...`)
  result = result.replace(/`([^`]+)`/g, '$1');

  // Remove images (![alt](url))
  result = result.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

  // Remove links but keep text ([text](url))
  result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove bold (**text** or __text__)
  result = result.replace(/(\*\*|__)(.*?)\1/g, '$2');

  // Remove italic (*text* or _text_)
  result = result.replace(/([*_])(.*?)\1/g, '$2');

  // Remove strikethrough (~~text~~)
  result = result.replace(/~~(.*?)~~/g, '$1');

  // Remove headings (# ## ### etc)
  result = result.replace(/^#{1,6}\s+/gm, '');

  // Remove list markers (- or * or + or 1. etc)
  result = result.replace(/^[\s]*[-*+]\s+/gm, '');
  result = result.replace(/^[\s]*\d+\.\s+/gm, '');

  // Remove blockquote markers (>)
  result = result.replace(/^>\s+/gm, '');

  // Remove horizontal rules (--- or ***)
  result = result.replace(/^[-*_]{3,}\s*$/gm, '');

  // Remove HTML tags
  result = result.replace(/<[^>]+>/g, '');

  return result;
}

/**
 * Count characters in text, excluding markdown syntax
 */
export function countPlainTextCharacters(text: string): number {
  return stripMarkdown(text).length;
}

/**
 * Count characters in selected text, excluding markdown syntax
 */
export function countSelectedCharacters(text: string): number {
  // For selections, we want to be more lenient and just count the actual text
  // without stripping markdown, since users might want to know the selected syntax too
  // But we can add this as an option later if needed
  return stripMarkdown(text).length;
}
