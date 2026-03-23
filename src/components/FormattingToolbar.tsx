import { useState, useEffect } from 'react';
import { Button } from './Button';
import { TableGridSelector } from './TableGridSelector';
import { useEditorStore } from '../store/useEditorStore';
import { formats, hasFormat, hasBulletList, hasNumberedList, hasHeading } from '../utils/markdownFormatting';

export function FormattingToolbar() {
  const theme = useEditorStore((s) => s.theme);
  const editorView = useEditorStore((s) => s.editorView);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    strikethrough: false,
    code: false,
    bulletList: false,
    numberedList: false,
    heading: false
  });

  // Update active formats when selection changes
  useEffect(() => {
    if (!editorView) return;

    const updateActiveFormats = () => {
      // Use setTimeout to ensure we get the updated state after any changes
      setTimeout(() => {
        if (!editorView) return;
        setActiveFormats({
          bold: hasFormat(editorView, '**', '**'),
          italic: hasFormat(editorView, '_', '_'),
          strikethrough: hasFormat(editorView, '~~', '~~'),
          code: hasFormat(editorView, '`', '`'),
          bulletList: hasBulletList(editorView),
          numberedList: hasNumberedList(editorView),
          heading: hasHeading(editorView),
        });
      }, 0);
    };

    // Initial update
    updateActiveFormats();

    // Update on various events
    const handleUpdate = () => updateActiveFormats();
    const interval = setInterval(updateActiveFormats, 100); // Poll every 100ms as fallback

    editorView.dom.addEventListener('mouseup', handleUpdate);
    editorView.dom.addEventListener('keyup', handleUpdate);
    editorView.dom.addEventListener('click', handleUpdate);
    editorView.dom.addEventListener('input', handleUpdate);
    editorView.dom.addEventListener('focus', handleUpdate);

    return () => {
      clearInterval(interval);
      editorView.dom.removeEventListener('mouseup', handleUpdate);
      editorView.dom.removeEventListener('keyup', handleUpdate);
      editorView.dom.removeEventListener('click', handleUpdate);
      editorView.dom.removeEventListener('input', handleUpdate);
      editorView.dom.removeEventListener('focus', handleUpdate);
    };
  }, [editorView]);

  if (!editorView) return null;

  const borderColor = theme === 'dark' ? 'border-[#3e3e42]' : 'border-gray-300';
  const bgColor = theme === 'dark' ? 'bg-[#252526]' : 'bg-white';
  const dividerColor = theme === 'dark' ? 'bg-[#3e3e42]' : 'bg-gray-300';

  // Active button styling - adds a 1px blue border around active buttons
  const getButtonClass = (isActive: boolean) =>
    isActive ? 'border border-theme-primary' : '';

  return (
    <div className={`flex items-center gap-1 px-3 py-1.5 border-b ${borderColor} ${bgColor}`}>
      {/* Text formatting */}
      <Button
        variant="secondary"
        iconOnly
        onClick={() => formats.bold(editorView)}
        title="Bold (Ctrl+B)"
        className={getButtonClass(activeFormats.bold)}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </svg>
      </Button>

      <Button
        variant="secondary"
        iconOnly
        onClick={() => formats.italic(editorView)}
        title="Italic (Ctrl+I)"
        className={getButtonClass(activeFormats.italic)}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="4" x2="10" y2="4" />
          <line x1="14" y1="20" x2="5" y2="20" />
          <line x1="15" y1="4" x2="9" y2="20" />
        </svg>
      </Button>

      <Button
        variant="secondary"
        iconOnly
        onClick={() => formats.strikethrough(editorView)}
        title="Strikethrough"
        className={getButtonClass(activeFormats.strikethrough)}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4H9a3 3 0 0 0-2.83 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 12a4 4 0 0 1 0 8H6" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
        </svg>
      </Button>

      {/* Divider */}
      <div className={`w-px h-5 ${dividerColor}`} />

      {/* Headings Dropdown */}
      <select
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'h1') formats.heading1(editorView);
          else if (value === 'h2') formats.heading2(editorView);
          else if (value === 'h3') formats.heading3(editorView);
          e.target.value = ''; // Reset to placeholder
        }}
        value=""
        className={`px-2 py-1 text-sm rounded transition-colors ${
          theme === 'dark'
            ? 'bg-[#2d2d2d] hover:bg-[#3e3e42] text-gray-300 border border-[#3e3e42]'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
        }`}
        title="Insert Heading"
      >
        <option value="" disabled>Heading</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      {/* Divider */}
      <div className={`w-px h-5 ${dividerColor}`} />

      {/* Lists & Other */}
      <Button
        variant="secondary"
        iconOnly
        onClick={() => formats.bulletList(editorView)}
        title="Bullet List"
        className={getButtonClass(activeFormats.bulletList)}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <circle cx="3" cy="6" r="1" fill="currentColor" />
          <circle cx="3" cy="12" r="1" fill="currentColor" />
          <circle cx="3" cy="18" r="1" fill="currentColor" />
        </svg>
      </Button>

      <Button
        variant="secondary"
        iconOnly
        onClick={() => formats.numberedList(editorView)}
        title="Numbered List"
        className={getButtonClass(activeFormats.numberedList)}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="10" y1="6" x2="21" y2="6" />
          <line x1="10" y1="12" x2="21" y2="12" />
          <line x1="10" y1="18" x2="21" y2="18" />
          <path d="M4 6h1v4" strokeLinecap="round" />
          <path d="M4 10h2" strokeLinecap="round" />
          <path d="M6 14H4c0-1 2-2 2-3s-1-1.5-1-1.5" strokeLinecap="round" />
          <path d="M4 18h2v-2H4" strokeLinecap="round" />
        </svg>
      </Button>

      {/* Divider */}
      <div className={`w-px h-5 ${dividerColor}`} />

      {/* Table */}
      <TableGridSelector
        onInsert={(rows, cols) => formats.table(editorView, rows, cols)}
      />

      {/* Divider */}
      <div className={`w-px h-5 ${dividerColor}`} />

      <Button
        variant="secondary"
        iconOnly
        onClick={() => formats.link(editorView)}
        title="Link (Ctrl+K)"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>

      <Button
        variant="secondary"
        iconOnly
        onClick={() => formats.inlineCode(editorView)}
        title="Inline Code (Ctrl+`)"
        className={getButtonClass(activeFormats.code)}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="8 6 2 12 8 18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>
    </div>
  );
}
