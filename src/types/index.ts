export interface Tab {
  id: string;
  title: string;
  filePath: string | null;  // null = untitled, BROWSER_SAVE = named web download, else a desktop path
  suggestedPath?: string;    // where Save As starts for a tab with no target yet, e.g. an imported .docx
  content: string;
  isDirty: boolean;          // unsaved changes
}
