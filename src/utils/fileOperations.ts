import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import mammoth from 'mammoth';
import type { Tab } from '../types';
import { markdownToDocxBuffer } from './docxExport';

export const isTauri = () => !!(window as any).__TAURI_INTERNALS__;

export async function openFileDialog(): Promise<string | File | null> {
  if (!isTauri()) {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.markdown,.txt,.docx';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        resolve(file || null);
      };
      input.click();
    });
  }

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

export async function saveFileDialog(defaultPath?: string | File): Promise<string | File | null> {
  if (!isTauri()) return 'browser-save'; 

  const initialPath = typeof defaultPath === 'string' ? defaultPath : undefined;
  const selected = await save({
    defaultPath: initialPath,
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

export async function readFile(path: string | File): Promise<string> {
  if (!isTauri() && path instanceof File) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsText(path);
    });
  }
  if (typeof path !== 'string') throw new Error('Cannot invoke Tauri command with File object');
  return invoke<string>('read_file', { path });
}

export async function readFileBinary(path: string | File): Promise<ArrayBuffer> {
  if (!isTauri() && path instanceof File) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.readAsArrayBuffer(path);
    });
  }
  const bytes = await invoke<number[]>('read_file_binary', { path });
  return new Uint8Array(bytes).buffer;
}

export async function writeFile(path: string | File, content: string): Promise<void> {
  if (!isTauri()) {
    // Browser download fallback
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileName = path instanceof File ? path.name : (path === 'browser-save' ? 'document.md' : path);
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  await invoke('write_file', { path, content });
}

export function getFileName(path: string | File): string {
  if (typeof path !== 'string') return path.name;
  return path.split(/[\\/]/).pop() || 'Untitled';
}

function cleanMammothMarkdown(markdown: string): string {
  // Remove unnecessary escapes that mammoth adds
  return markdown
    .replace(/\\([().\-])/g, '$1')  // Unescape parentheses, periods, and dashes
    .replace(/\\\\/g, '\\');         // Fix double-escaped backslashes
}

export async function openAndReadFile(path: string | File): Promise<string> {
  const fileName = typeof path === 'string' ? path : path.name;
  const ext = fileName.toLowerCase().split('.').pop();

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
  updateTabPath: (tabId: string, path: string | File, title: string) => void
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
  if (!isTauri()) return; // Not supported for now
  // Tauri expects Vec<u8> — convert ArrayBuffer to a plain number array
  const bytes = Array.from(new Uint8Array(data));
  await invoke('write_file_binary', { path, data: bytes });
}

export async function exportAsDocx(content: string, currentFilePath?: string | File | null): Promise<void> {
  try {
    const defaultName = currentFilePath
      ? (typeof currentFilePath === 'string' ? getFileName(currentFilePath) : (currentFilePath as File).name).replace(/\.(md|markdown|txt)$/i, '.docx')
      : 'document.docx';

    if (!isTauri()) {
      const arrayBuffer = await markdownToDocxBuffer(content);
      const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultName;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

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
