export interface Tab {
  id: string;
  title: string;
  filePath: string | null;  // null = untitled
  content: string;
  isDirty: boolean;          // unsaved changes
}
