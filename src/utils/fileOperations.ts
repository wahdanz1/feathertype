import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import mammoth from 'mammoth';
import type { Tab } from '../types';
import { markdownToDocxBuffer } from './docxExport';

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
    // mammoth's TS types omit convertToMarkdown — cast to any to bypass
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (mammoth as any).convertToMarkdown({ arrayBuffer });
    return cleanMammothMarkdown(result.value);
  } else {
    // Read as text file (.md, .markdown, .txt)
    return readFile(path);
  }
}

export async function handleSaveFile(
  tab: Tab,
  markTabClean: (tabId: string) => void,
  updateTabPath: (tabId: string, path: string, title: string) => void
): Promise<void> {
  try {
    if (tab.filePath) {
      await writeFile(tab.filePath, tab.content);
      markTabClean(tab.id);
    } else {
      // Save As
      const path = await saveFileDialog(tab.filePath || undefined);
      if (path) {
        await writeFile(path, tab.content);
        const title = getFileName(path);
        updateTabPath(tab.id, path, title);
        markTabClean(tab.id);
      }
    }
  } catch (error) {
    console.error('Failed to save file:', error);
    alert('Failed to save file: ' + error);
    throw error;
  }
}

export async function writeFileBinary(path: string, data: ArrayBuffer): Promise<void> {
  // Tauri expects Vec<u8> — convert ArrayBuffer to a plain number array
  const bytes = Array.from(new Uint8Array(data));
  await invoke('write_file_binary', { path, data: bytes });
}

export async function exportAsDocx(content: string, currentFilePath?: string | null): Promise<void> {
  try {
    // Derive a sensible default filename from the current file path (if any)
    const defaultName = currentFilePath
      ? getFileName(currentFilePath).replace(/\.(md|markdown|txt)$/i, '.docx')
      : 'document.docx';

    const path = await save({
      defaultPath: defaultName,
      filters: [{ name: 'Word Document', extensions: ['docx'] }],
    });

    if (!path) return; // user cancelled

    const arrayBuffer = await markdownToDocxBuffer(content);
    await writeFileBinary(path, arrayBuffer);
  } catch (error) {
    console.error('Failed to export DOCX:', error);
    alert('Failed to export as DOCX: ' + error);
  }
}
