import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import mammoth from 'mammoth';
import type { Tab } from '../types';
import { markdownToDocxBuffer } from './docxExport';

export const isTauri = () => !!window.__TAURI_INTERNALS__;

export const BROWSER_SAVE = 'browser-save';

type MarkTabClean = (tabId: string, savedContent: string) => void;
type UpdateTabPath = (tabId: string, path: string, title: string) => void;

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const isDocxPath = (path: string): boolean => path.toLowerCase().endsWith('.docx');

export const toMarkdownPath = (path: string): string => path.replace(/\.docx$/i, '.md');

function downloadBlob(data: BlobPart, fileName: string, mime: string): void {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

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

export async function saveFileDialog(defaultPath?: string | null): Promise<string | null> {
  if (!isTauri()) return BROWSER_SAVE;

  const initialPath = defaultPath && defaultPath !== BROWSER_SAVE ? defaultPath : undefined;
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
      {
        name: 'Word Document',
        extensions: ['docx'],
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

export async function writeFile(path: string, content: string, downloadName?: string): Promise<void> {
  if (!isTauri()) {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const baseName = downloadName || 'document';
    const fileName = baseName.endsWith('.md') ? baseName : `${baseName}.md`;
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  await invoke('write_file', { path, content });
}

// Writes editor content to a target path, converting markdown to a real DOCX
// package when the path is a .docx — otherwise the markdown source would be
// written verbatim and Word would reject the file as unreadable.
async function writeContent(path: string, content: string): Promise<void> {
  if (isDocxPath(path)) {
    await writeFileBinary(path, await markdownToDocxBuffer(content));
    return;
  }
  await writeFile(path, content);
}

async function downloadContent(name: string, content: string): Promise<void> {
  if (isDocxPath(name)) {
    downloadBlob(await markdownToDocxBuffer(content), name, DOCX_MIME);
    return;
  }
  await writeFile(BROWSER_SAVE, content, name);
}

export function getFileName(path: string | File): string {
  if (typeof path !== 'string') return path.name;
  return path.split(/[\\/]/).pop() || 'Untitled';
}

function cleanMammothMarkdown(markdown: string): string {
  return markdown
    .replace(/\\([().-])/g, '$1')  // Unescape parentheses, periods, and dashes
    .replace(/\\\\/g, '\\');         // Fix double-escaped backslashes
}

export async function openAndReadFile(path: string | File): Promise<string> {
  const fileName = typeof path === 'string' ? path : path.name;
  const ext = fileName.toLowerCase().split('.').pop();

  if (ext === 'docx') {
    const arrayBuffer = await readFileBinary(path);
    // mammoth's TS types omit convertToMarkdown
    const result = await (mammoth as typeof mammoth & { convertToMarkdown: typeof mammoth.convertToHtml }).convertToMarkdown({ arrayBuffer });
    return cleanMammothMarkdown(result.value);
  } else {
    return readFile(path);
  }
}

export async function openFile(): Promise<Pick<Tab, 'filePath' | 'title' | 'content' | 'suggestedPath'> | null> {
  const path = await openFileDialog();
  if (path === null) return null;
  const content = await openAndReadFile(path);
  const title = getFileName(path);
  if (isDocxPath(title)) {
    // Saving rebuilds Word files from Markdown, dropping images, styles and comments, so an import never targets its source.
    const suggestedPath = toMarkdownPath(typeof path === 'string' ? path : title);
    return { filePath: null, title: getFileName(suggestedPath), content, suggestedPath };
  }
  // A File can't be persisted, so a web tab keeps only its name and saves as a download of it.
  return { filePath: typeof path === 'string' ? path : BROWSER_SAVE, title, content };
}

// Resolves true only once the content was written; failures are reported here and never thrown.
export async function handleSaveFile(
  tab: Tab,
  markTabClean: MarkTabClean,
  updateTabPath: UpdateTabPath
): Promise<boolean> {
  const { id, content } = tab;
  try {
    if (tab.filePath && tab.filePath !== BROWSER_SAVE) {
      await writeContent(tab.filePath, content);
    } else if (!isTauri()) {
      const name = tab.title === 'Untitled' || tab.suggestedPath
        ? promptFileName(tab.title)
        : tab.title;
      if (!name) return false;
      await downloadContent(name, content);
      updateTabPath(id, BROWSER_SAVE, name);
    } else {
      const path = await saveFileDialog(tab.filePath ?? tab.suggestedPath);
      if (!path) return false;
      await writeContent(path, content);
      updateTabPath(id, path, getFileName(path));
    }
    markTabClean(id, content);
    return true;
  } catch (error) {
    reportSaveError(error);
    return false;
  }
}

export async function handleSaveAsFile(
  tab: Tab,
  markTabClean: MarkTabClean,
  updateTabPath: UpdateTabPath
): Promise<boolean> {
  const { id, content } = tab;
  try {
    if (!isTauri()) {
      const name = promptFileName(tab.title);
      if (!name) return false;
      await downloadContent(name, content);
      updateTabPath(id, BROWSER_SAVE, name);
    } else {
      const path = await saveFileDialog(tab.filePath ?? tab.suggestedPath);
      if (!path) return false;
      await writeContent(path, content);
      updateTabPath(id, path, getFileName(path));
    }
    markTabClean(id, content);
    return true;
  } catch (error) {
    reportSaveError(error);
    return false;
  }
}

function reportSaveError(error: unknown): void {
  console.error('Failed to save file:', error);
  alert('Failed to save file: ' + error);
}

function promptFileName(defaultName: string): string | null {
  const name = window.prompt('File name:', defaultName === 'Untitled' ? '' : defaultName);
  return name?.trim() || null;
}

export async function writeFileBinary(path: string, data: ArrayBuffer): Promise<void> {
  if (!isTauri()) return;
  // Tauri expects Vec<u8>
  const bytes = Array.from(new Uint8Array(data));
  await invoke('write_file_binary', { path, data: bytes });
}

function docxNameFor(tab: Pick<Tab, 'filePath' | 'title' | 'suggestedPath'>): string {
  if (!tab.filePath && !tab.suggestedPath) return 'document.docx';
  const source = tab.filePath && tab.filePath !== BROWSER_SAVE ? getFileName(tab.filePath) : tab.title;
  const base = source.replace(/\.(md|markdown|txt)$/i, '');
  return isDocxPath(base) ? base : `${base}.docx`;
}

export async function exportAsDocx(tab: Pick<Tab, 'content' | 'filePath' | 'title' | 'suggestedPath'>): Promise<void> {
  const { content } = tab;
  try {
    const defaultName = docxNameFor(tab);

    if (!isTauri()) {
      const arrayBuffer = await markdownToDocxBuffer(content);
      downloadBlob(arrayBuffer, defaultName, DOCX_MIME);
      return;
    }

    const path = await save({
      defaultPath: defaultName,
      filters: [{ name: 'Word Document', extensions: ['docx'] }],
    });

    if (!path) return;

    const arrayBuffer = await markdownToDocxBuffer(content);
    await writeFileBinary(path, arrayBuffer);
  } catch (error) {
    console.error('Failed to export DOCX:', error);
    alert('Failed to export as DOCX: ' + error);
  }
}
