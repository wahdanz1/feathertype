export interface Tab {
  id: string;
  title: string;
  filePath: string | File | null;  // null = untitled, string = Tauri path, File = Web file
  content: string;
  isDirty: boolean;          // unsaved changes
}
