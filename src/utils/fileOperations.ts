import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import mammoth from 'mammoth';

export async function openFileDialog(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    filters: [
      {
        name: 'All Supported Files',
        extensions: ['md', 'markdown', 'txt', 'docx'],
      },
      {
        name: 'Markdown',
        extensions: ['md', 'markdown', 'txt'],
      },
      {
        name: 'Word Document',
        extensions: ['docx'],
      },
    ],
  });

  if (typeof selected === 'string') {
    return selected;
  }
  return null;
}

export async function saveFileDialog(defaultPath?: string): Promise<string | null> {
  const selected = await save({
    defaultPath,
    filters: [
      {
        name: 'Markdown',
        extensions: ['md', 'markdown'],
      },
      {
        name: 'Text',
        extensions: ['txt'],
      },
    ],
  });

  return selected;
}

export async function readFile(path: string): Promise<string> {
  return invoke<string>('read_file', { path });
}

export async function readFileBinary(path: string): Promise<ArrayBuffer> {
  const bytes = await invoke<number[]>('read_file_binary', { path });
  return new Uint8Array(bytes).buffer;
}

export async function writeFile(path: string, content: string): Promise<void> {
  await invoke('write_file', { path, content });
}

export function getFileName(path: string): string {
  return path.split(/[\\/]/).pop() || 'Untitled';
}

function cleanMammothMarkdown(markdown: string): string {
  // Remove unnecessary escapes that mammoth adds
  return markdown
    .replace(/\\([().\-])/g, '$1')  // Unescape parentheses, periods, and dashes
    .replace(/\\\\/g, '\\');         // Fix double-escaped backslashes
}

export async function openAndReadFile(path: string): Promise<string> {
  const ext = path.toLowerCase().split('.').pop();

  if (ext === 'docx') {
    // Read .docx file as binary and convert to markdown
    const arrayBuffer = await readFileBinary(path);
    const result = await mammoth.convertToMarkdown({ arrayBuffer });
    return cleanMammothMarkdown(result.value);
  } else {
    // Read as text file (.md, .markdown, .txt)
    return readFile(path);
  }
}
