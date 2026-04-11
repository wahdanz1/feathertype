import { useState, useEffect } from 'react';
import type { EditorView } from '@codemirror/view';
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

  const refreshActiveFormats = () => {
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

  useEffect(() => {
    if (!editorView) return;
    refreshActiveFormats();
    editorView.dom.addEventListener('mouseup', refreshActiveFormats);
    editorView.dom.addEventListener('keyup', refreshActiveFormats);
    editorView.dom.addEventListener('click', refreshActiveFormats);
    editorView.dom.addEventListener('focus', refreshActiveFormats);
    return () => {
      editorView.dom.removeEventListener('mouseup', refreshActiveFormats);
      editorView.dom.removeEventListener('keyup', refreshActiveFormats);
      editorView.dom.removeEventListener('click', refreshActiveFormats);
      editorView.dom.removeEventListener('focus', refreshActiveFormats);
    };
  }, [editorView]);

  /** Apply a format and refresh active state indicators */
  const applyFormat = (formatFn: (view: EditorView) => void) => {
    if (!editorView) return;
    formatFn(editorView);
    refreshActiveFormats();
  };

  const dividerColor = theme === 'dark' ? 'bg-border' : 'bg-border-light';
  const getButtonClass = (isActive: boolean) => isActive ? 'border border-theme-primary bg-white/10 dark:bg-white/5 shadow-sm scale-[0.98]' : '';

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 ${
        theme === 'dark' ? 'bg-editor-surface' : 'bg-editor-surface-light'
      }`}
      onMouseDown={(e) => {
        // Prevent toolbar clicks from stealing focus from the editor
        if ((e.target as HTMLElement).tagName !== 'SELECT' && (e.target as HTMLElement).tagName !== 'INPUT') {
          e.preventDefault();
        }
      }}
    >
      <FileMenu />
      
      <div className={`w-px h-6 ${dividerColor} mx-1`} />

      <Button variant="secondary" iconOnly onClick={() => applyFormat(formats.bold)} title="Bold (Ctrl+B)" className={getButtonClass(activeFormats.bold)}>
        <LuBold className="w-5 h-5" />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => applyFormat(formats.italic)} title="Italic (Ctrl+I)" className={getButtonClass(activeFormats.italic)}>
        <LuItalic className="w-5 h-5" />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => applyFormat(formats.strikethrough)} title="Strikethrough" className={getButtonClass(activeFormats.strikethrough)}>
        <LuStrikethrough className="w-5 h-5" />
      </Button>

      <Dropdown
        value={activeFormats.headingLevel > 0 ? `h${activeFormats.headingLevel}` : ''}
        onChange={(value) => {
          if (value === 'h1') applyFormat(formats.heading1);
          else if (value === 'h2') applyFormat(formats.heading2);
          else if (value === 'h3') applyFormat(formats.heading3);
          else if (value === '' && activeFormats.headingLevel > 0) {
            const level = activeFormats.headingLevel;
            if (level === 1) applyFormat(formats.heading1);
            else if (level === 2) applyFormat(formats.heading2);
            else if (level === 3) applyFormat(formats.heading3);
          }
        }}
        options={[
          { value: '', label: 'No Heading' },
          { value: 'h1', label: 'H1' },
          { value: 'h2', label: 'H2' },
          { value: 'h3', label: 'H3' },
        ]}
        isActive={activeFormats.heading}
        title="Heading (Ctrl+1/2/3)"
      />

      <div className={`w-px h-6 ${dividerColor} mx-1`} />

      <Button variant="secondary" iconOnly onClick={() => applyFormat(formats.bulletList)} title="Bullet List (Ctrl+Shift+B)" className={getButtonClass(activeFormats.bulletList)}>
        <LuList className="w-5 h-5" />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => applyFormat(formats.numberedList)} title="Numbered List (Ctrl+Shift+N)" className={getButtonClass(activeFormats.numberedList)}>
        <LuListOrdered className="w-5 h-5" />
      </Button>

      <TableGridSelector onInsert={(rows, cols) => { if (editorView) formats.table(editorView, rows, cols); refreshActiveFormats(); }} />

      <div className={`w-px h-6 ${dividerColor} mx-1`} />

      <Button variant="secondary" iconOnly onClick={() => applyFormat(formats.link)} title="Link (Ctrl+K)">
        <LuLink2 className="w-5 h-5" />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => applyFormat(formats.inlineCode)} title="Inline Code (Ctrl+`)" className={getButtonClass(activeFormats.code)}>
        <LuCode className="w-5 h-5" />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => applyFormat(formats.comment)} title="Comment (Ctrl+Shift+/)">
        <LuFileCode className="w-5 h-5" />
      </Button>

      <div className={`w-px h-6 ${dividerColor} mx-1`} />

      <Button variant="secondary" iconOnly onClick={toggleLineWrap} title="Word Wrap (Alt+Z)" className={getButtonClass(lineWrap)}>
        <LuWrapText className="w-5 h-5" />
      </Button>

      <div className="flex-1" />
      
      <Button variant="secondary" iconOnly onClick={toggleTheme} title="Toggle Theme">
        {theme === 'dark' ? <LuSun className="w-5 h-5" /> : <LuMoon className="w-5 h-5" />}
      </Button>
    </div>
  );
}
