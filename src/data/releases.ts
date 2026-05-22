export interface Release {
  version: string;
  date: string;
  type: 'Stable' | 'Beta' | 'Legacy';
  changes: string[];
}

export const RELEASES: Release[] = [
  {
    version: '1.1.0',
    date: 'May 22, 2026',
    type: 'Stable',
    changes: [
      'DOCX export — save your Markdown as a Word document',
      'Reliable .docx round-trip — opening and saving a Word file keeps it a valid document',
      'Inline formatting (bold, italic, strikethrough) now preserved on export',
      'Tables export correctly to DOCX'
    ]
  },
  {
    version: '1.0.0',
    date: 'April 8, 2026',
    type: 'Legacy',
    changes: [
      'Initial public release',
      'Native DOCX Import support',
      'Live Markdown split-pane preview',
      'Offline-first document management',
      'Customizable editor themes (Dark/Light)',
      'Unsaved changes tracking and recovery',
      'High-performance Rust/Tauri core',
      'System-native file system integration'
    ]
  }
];
