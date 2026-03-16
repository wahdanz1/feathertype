import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';

export async function openFileDialog(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    filters: [
      {
        name: 'Markdown',
        extensions: ['md', 'markdown', 'txt'],
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
        extensions: ['md'],
      },
    ],
  });

  return selected;
}

export async function readFile(path: string): Promise<string> {
  return invoke<string>('read_file', { path });
}

export async function writeFile(path: string, content: string): Promise<void> {
  await invoke('write_file', { path, content });
}

export function getFileName(path: string): string {
  return path.split(/[\\/]/).pop() || 'Untitled';
}
