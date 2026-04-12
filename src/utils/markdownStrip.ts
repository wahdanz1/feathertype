export function stripMarkdown(text: string): string {
  let result = text;

  result = result.replace(/```[\s\S]*?```/g, '');
  result = result.replace(/`([^`]+)`/g, '$1');
  result = result.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
  result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  result = result.replace(/(\*\*|__)(.*?)\1/g, '$2');
  result = result.replace(/([*_])(.*?)\1/g, '$2');
  result = result.replace(/~~(.*?)~~/g, '$1');
  result = result.replace(/^#{1,6}\s+/gm, '');
  result = result.replace(/^[\s]*[-*+]\s+/gm, '');
  result = result.replace(/^[\s]*\d+\.\s+/gm, '');
  result = result.replace(/^>\s+/gm, '');
  result = result.replace(/^[-*_]{3,}\s*$/gm, '');
  result = result.replace(/<[^>]+>/g, '');

  return result;
}

export function countPlainTextCharacters(text: string): number {
  return stripMarkdown(text).length;
}

export function countSelectedCharacters(text: string): number {
  return stripMarkdown(text).length;
}
