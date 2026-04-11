import { useState, useEffect } from 'react';
import { LuSun, LuMoon, LuBold, LuItalic, LuStrikethrough, LuList, LuListOrdered, LuLink2, LuCode, LuFileCode, LuWrapText } from 'react-icons/lu';
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
        <LuBold className="w-5 h-5" />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => formats.italic(editorView!)} title="Italic" className={getButtonClass(activeFormats.italic)}>
        <LuItalic className="w-5 h-5" />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => formats.strikethrough(editorView!)} title="Strikethrough" className={getButtonClass(activeFormats.strikethrough)}>
        <LuStrikethrough className="w-5 h-5" />
      </Button>

      <Dropdown
        value={activeFormats.headingLevel > 0 ? `h${activeFormats.headingLevel}` : ''}
        onChange={(value) => {
          if (!editorView) return;
          if (value === 'h1') formats.heading1(editorView);
          else if (value === 'h2') formats.heading2(editorView);
          else if (value === 'h3') formats.heading3(editorView);
          else if (value === '' && activeFormats.headingLevel > 0) {
            // Remove current heading
            const level = activeFormats.headingLevel;
            if (level === 1) formats.heading1(editorView);
            else if (level === 2) formats.heading2(editorView);
            else if (level === 3) formats.heading3(editorView);
          }
        }}
        options={[
          { value: '', label: 'No Heading' },
          { value: 'h1', label: 'H1' },
          { value: 'h2', label: 'H2' },
          { value: 'h3', label: 'H3' },
        ]}
        isActive={activeFormats.heading}
        title="Heading"
      />

      <div className={`w-px h-6 ${dividerColor} mx-1`} />

      <Button variant="secondary" iconOnly onClick={() => formats.bulletList(editorView!)} title="Bullet List" className={getButtonClass(activeFormats.bulletList)}>
        <LuList className="w-5 h-5" />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => formats.numberedList(editorView!)} title="Numbered List" className={getButtonClass(activeFormats.numberedList)}>
        <LuListOrdered className="w-5 h-5" />
      </Button>

      <TableGridSelector onInsert={(rows, cols) => formats.table(editorView!, rows, cols)} />

      <div className={`w-px h-6 ${dividerColor} mx-1`} />

      <Button variant="secondary" iconOnly onClick={() => formats.link(editorView!)} title="Link">
        <LuLink2 className="w-5 h-5" />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => formats.inlineCode(editorView!)} title="Code" className={getButtonClass(activeFormats.code)}>
        <LuCode className="w-5 h-5" />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => formats.comment(editorView!)} title="Docx Tooltip">
        <LuFileCode className="w-5 h-5" />
      </Button>

      <div className={`w-px h-6 ${dividerColor} mx-1`} />

      <Button variant="secondary" iconOnly onClick={toggleLineWrap} title="Word Wrap" className={getButtonClass(lineWrap)}>
        <LuWrapText className="w-5 h-5" />
      </Button>

      <div className="flex-1" />
      
      <Button variant="secondary" iconOnly onClick={toggleTheme} title="Toggle Theme">
        {theme === 'dark' ? <LuSun className="w-5 h-5" /> : <LuMoon className="w-5 h-5" />}
      </Button>
    </div>
  );
}
