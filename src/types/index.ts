export interface Tab {
  id: string;
  title: string;
  filePath: string | null;  // null = untitled, BROWSER_SAVE = named web download, else a desktop path
  content: string;
  isDirty: boolean;          // unsaved changes
}
