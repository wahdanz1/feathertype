import { useState, useEffect } from 'react';
import { Bold, Italic, Strikethrough, List, ListOrdered, Link2, Code2, FileCode2, WrapText } from 'lucide-react';
import { Button } from './Button';
import { Dropdown } from './Dropdown';
import { TableGridSelector } from './TableGridSelector';
import { useEditorStore } from '../store/useEditorStore';
import { formats, hasFormat, hasBulletList, hasNumberedList, hasHeading, getHeadingLevel } from '../utils/markdownFormatting';

export function FormattingToolbar() {
  const theme = useEditorStore((s) => s.theme);
  const editorView = useEditorStore((s) => s.editorView);
  const lineWrap = useEditorStore((s) => s.lineWrap);
  const toggleLineWrap = useEditorStore((s) => s.toggleLineWrap);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    strikethrough: false,
    code: false,
    bulletList: false,
    numberedList: false,
    heading: false,
    headingLevel: 0 // 0 = no heading, 1-6 = heading level
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
          headingLevel: getHeadingLevel(editorView),
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
      {/* === FORMAT CATEGORY === */}
      <Button
        variant="secondary"
        iconOnly
        onClick={() => formats.bold(editorView)}
        title="Bold (Ctrl+B)"
        className={getButtonClass(activeFormats.bold)}
      >
        <Bold className="w-6 h-6" />
      </Button>

      <Button
        variant="secondary"
        iconOnly
        onClick={() => formats.italic(editorView)}
        title="Italic (Ctrl+I)"
        className={getButtonClass(activeFormats.italic)}
      >
        <Italic className="w-6 h-6" />
      </Button>

      <Button
        variant="secondary"
        iconOnly
        onClick={() => formats.strikethrough(editorView)}
        title="Strikethrough"
        className={getButtonClass(activeFormats.strikethrough)}
      >
        <Strikethrough className="w-6 h-6" />
      </Button>

      <Dropdown
        value={activeFormats.headingLevel > 0 ? `h${activeFormats.headingLevel}` : ''}
        onChange={(value) => {
          const currentLevel = activeFormats.headingLevel;

          if (value === '') {
            // "No Heading" selected - remove heading if there is one
            if (currentLevel > 0) {
              if (currentLevel === 1) formats.heading1(editorView);
              else if (currentLevel === 2) formats.heading2(editorView);
              else if (currentLevel === 3) formats.heading3(editorView);
            }
          } else if ((value === 'h1' && currentLevel === 1) ||
                     (value === 'h2' && currentLevel === 2) ||
                     (value === 'h3' && currentLevel === 3)) {
            // Toggle off by applying the format again (it removes it)
            if (value === 'h1') formats.heading1(editorView);
            else if (value === 'h2') formats.heading2(editorView);
            else if (value === 'h3') formats.heading3(editorView);
          } else {
            // Apply new heading format
            if (value === 'h1') formats.heading1(editorView);
            else if (value === 'h2') formats.heading2(editorView);
            else if (value === 'h3') formats.heading3(editorView);
          }
        }}
        isActive={activeFormats.heading}
        title="Heading (Ctrl+1/2/3)"
      >
        <option value="">No Heading</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </Dropdown>

      <Button
        variant="secondary"
        iconOnly
        onClick={() => formats.bulletList(editorView)}
        title="Bullet List (Ctrl+Shift+B)"
        className={getButtonClass(activeFormats.bulletList)}
      >
        <List className="w-6 h-6" />
      </Button>

      <Button
        variant="secondary"
        iconOnly
        onClick={() => formats.numberedList(editorView)}
        title="Numbered List (Ctrl+Shift+N)"
        className={getButtonClass(activeFormats.numberedList)}
      >
        <ListOrdered className="w-6 h-6" />
      </Button>

      {/* Category Divider with extra spacing */}
      <div className={`w-px h-5 ${dividerColor} mx-2`} />

      {/* === INSERT CATEGORY === */}
      <TableGridSelector
        onInsert={(rows, cols) => formats.table(editorView, rows, cols)}
      />

      <Button
        variant="secondary"
        iconOnly
        onClick={() => formats.link(editorView)}
        title="Link (Ctrl+K)"
      >
        <Link2 className="w-6 h-6" />
      </Button>

      <Button
        variant="secondary"
        iconOnly
        onClick={() => formats.inlineCode(editorView)}
        title="Code Block (Ctrl+`)"
        className={getButtonClass(activeFormats.code)}
      >
        <Code2 className="w-6 h-6" />
      </Button>

      <Button
        variant="secondary"
        iconOnly
        onClick={() => formats.comment(editorView)}
        title="Comment (Ctrl+Shift+/)"
      >
        <FileCode2 className="w-6 h-6" />
      </Button>

      {/* Category Divider with extra spacing */}
      <div className={`w-px h-5 ${dividerColor} mx-2`} />

      {/* === VIEW CATEGORY === */}
      <Button
        variant="secondary"
        iconOnly
        onClick={toggleLineWrap}
        title="Word Wrap (Alt+Z)"
        className={getButtonClass(lineWrap)}
      >
        <WrapText className="w-6 h-6" />
      </Button>
    </div>
  );
}
