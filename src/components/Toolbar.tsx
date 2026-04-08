import { useState, useEffect } from 'react';
import { Sun, Moon, Bold, Italic, Strikethrough, List, ListOrdered, Link2, Code2, FileCode2, WrapText } from 'lucide-react';
import { FileMenu } from './FileMenu';
import { Button } from './Button';
import { Dropdown } from './Dropdown';
import { TableGridSelector } from './TableGridSelector';
import { useEditorStore } from '../store/useEditorStore';
import { formats, hasFormat, hasBulletList, hasNumberedList, hasHeading, getHeadingLevel } from '../utils/markdownFormatting';

export function Toolbar() {
  const toggleTheme = useEditorStore((s) => s.toggleTheme);
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
    headingLevel: 0
  });

  useEffect(() => {
    if (!editorView) return;
    const updateActiveFormats = () => {
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
    updateActiveFormats();
    const handleUpdate = () => updateActiveFormats();
    editorView.dom.addEventListener('mouseup', handleUpdate);
    editorView.dom.addEventListener('keyup', handleUpdate);
    editorView.dom.addEventListener('click', handleUpdate);
    editorView.dom.addEventListener('focus', handleUpdate);
    return () => {
      editorView.dom.removeEventListener('mouseup', handleUpdate);
      editorView.dom.removeEventListener('keyup', handleUpdate);
      editorView.dom.removeEventListener('click', handleUpdate);
      editorView.dom.removeEventListener('focus', handleUpdate);
    };
  }, [editorView]);

  const dividerColor = theme === 'dark' ? 'bg-[#3e3e42]' : 'bg-gray-300';
  const getButtonClass = (isActive: boolean) => isActive ? 'border border-theme-primary bg-white/10 dark:bg-white/5 shadow-sm scale-[0.98]' : '';

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 ${
      theme === 'dark' ? 'bg-[#252526]' : 'bg-[#f5f5f5]'
    }`}>
      <FileMenu />
      
      <div className={`w-px h-6 ${dividerColor} mx-1`} />

      <Button variant="secondary" iconOnly onClick={() => formats.bold(editorView!)} title="Bold" className={getButtonClass(activeFormats.bold)}>
        <Bold className="w-5 h-5" />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => formats.italic(editorView!)} title="Italic" className={getButtonClass(activeFormats.italic)}>
        <Italic className="w-5 h-5" />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => formats.strikethrough(editorView!)} title="Strikethrough" className={getButtonClass(activeFormats.strikethrough)}>
        <Strikethrough className="w-5 h-5" />
      </Button>

      <Dropdown
        value={activeFormats.headingLevel > 0 ? `h${activeFormats.headingLevel}` : ''}
        onChange={(value) => {
          if (!editorView) return;
          const currentLevel = activeFormats.headingLevel;
          if (value === '') { if (currentLevel > 0) { if (currentLevel === 1) formats.heading1(editorView); else if (currentLevel === 2) formats.heading2(editorView); else if (currentLevel === 3) formats.heading3(editorView); } }
          else if ((value === 'h1' && currentLevel === 1) || (value === 'h2' && currentLevel === 2) || (value === 'h3' && currentLevel === 3)) { if (value === 'h1') formats.heading1(editorView); else if (value === 'h2') formats.heading2(editorView); else if (value === 'h3') formats.heading3(editorView); }
          else { if (value === 'h1') formats.heading1(editorView); else if (value === 'h2') formats.heading2(editorView); else if (value === 'h3') formats.heading3(editorView); }
        }}
        isActive={activeFormats.heading}
        title="Heading"
      >
        <option value="">No Heading</option>
        <option value="h1">H1</option>
        <option value="h2">H2</option>
        <option value="h3">H3</option>
      </Dropdown>

      <div className={`w-px h-6 ${dividerColor} mx-1`} />

      <Button variant="secondary" iconOnly onClick={() => formats.bulletList(editorView!)} title="Bullet List" className={getButtonClass(activeFormats.bulletList)}>
        <List className="w-5 h-5" />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => formats.numberedList(editorView!)} title="Numbered List" className={getButtonClass(activeFormats.numberedList)}>
        <ListOrdered className="w-5 h-5" />
      </Button>

      <TableGridSelector onInsert={(rows, cols) => formats.table(editorView!, rows, cols)} />

      <div className={`w-px h-6 ${dividerColor} mx-1`} />

      <Button variant="secondary" iconOnly onClick={() => formats.link(editorView!)} title="Link">
        <Link2 className="w-5 h-5" />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => formats.inlineCode(editorView!)} title="Code" className={getButtonClass(activeFormats.code)}>
        <Code2 className="w-5 h-5" />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => formats.comment(editorView!)} title="Docx Tooltip">
        <FileCode2 className="w-5 h-5" />
      </Button>

      <div className={`w-px h-6 ${dividerColor} mx-1`} />

      <Button variant="secondary" iconOnly onClick={toggleLineWrap} title="Word Wrap" className={getButtonClass(lineWrap)}>
        <WrapText className="w-5 h-5" />
      </Button>

      <div className="flex-1" />
      
      <Button variant="secondary" iconOnly onClick={toggleTheme} title="Toggle Theme">
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>
    </div>
  );
}
