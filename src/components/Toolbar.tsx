import { useState, useEffect } from 'react';
import type { EditorView } from '@codemirror/view';
import { LuSun, LuMoon, LuBold, LuItalic, LuStrikethrough, LuList, LuListOrdered, LuLink2, LuCode, LuWrapText, LuTextQuote } from 'react-icons/lu';
import { FileMenu } from './FileMenu';
import { Button } from './Button';
import { Dropdown } from './Dropdown';
import { TableGridSelector } from './TableGridSelector';
import { useEditorStore } from '../store/useEditorStore';
import { subscribeEditorUpdates } from '../lib/editorUpdates';
import { formats, hasFormat, hasBlockquote, hasBulletList, hasNumberedList, hasHeading, getHeadingLevel } from '../utils/markdownFormatting';

interface ActiveFormats {
  view: EditorView | null;
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  code: boolean;
  blockquote: boolean;
  bulletList: boolean;
  numberedList: boolean;
  heading: boolean;
  headingLevel: number;
}

function readFormats(view: EditorView | null): ActiveFormats {
  return {
    view,
    bold: hasFormat(view, '**'),
    italic: hasFormat(view, '_'),
    strikethrough: hasFormat(view, '~~'),
    code: hasFormat(view, '`'),
    blockquote: hasBlockquote(view),
    bulletList: hasBulletList(view),
    numberedList: hasNumberedList(view),
    heading: hasHeading(view),
    headingLevel: getHeadingLevel(view),
  };
}

const sameFormats = (a: ActiveFormats, b: ActiveFormats) =>
  (Object.keys(a) as (keyof ActiveFormats)[]).every((key) => a[key] === b[key]);

export function Toolbar() {
  const toggleTheme = useEditorStore((s) => s.toggleTheme);
  const theme = useEditorStore((s) => s.theme);
  const editorView = useEditorStore((s) => s.editorView);
  const lineWrap = useEditorStore((s) => s.lineWrap);
  const toggleLineWrap = useEditorStore((s) => s.toggleLineWrap);

  const [activeFormats, setActiveFormats] = useState(() => readFormats(editorView));
  if (activeFormats.view !== editorView) setActiveFormats(readFormats(editorView));

  useEffect(() => {
    if (!editorView) return;
    return subscribeEditorUpdates((update) => {
      if (update.view !== editorView) return;
      const next = readFormats(editorView);
      setActiveFormats((current) => (sameFormats(current, next) ? current : next));
    });
  }, [editorView]);

  const applyFormat = (formatFn: (view: EditorView) => void) => {
    if (!editorView) return;
    formatFn(editorView);
  };

  const dividerColor = theme === 'dark' ? 'bg-border' : 'bg-border-light';
  const getButtonClass = (isActive: boolean) => isActive ? 'border border-theme-primary bg-white/5 shadow-sm scale-[0.98]' : '';

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 editor-chrome"
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
        <LuBold  />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => applyFormat(formats.italic)} title="Italic (Ctrl+I)" className={getButtonClass(activeFormats.italic)}>
        <LuItalic  />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => applyFormat(formats.strikethrough)} title="Strikethrough" className={getButtonClass(activeFormats.strikethrough)}>
        <LuStrikethrough  />
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
        <LuList  />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => applyFormat(formats.numberedList)} title="Numbered List (Ctrl+Shift+N)" className={getButtonClass(activeFormats.numberedList)}>
        <LuListOrdered  />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => applyFormat(formats.blockquote)} title="Blockquote" className={getButtonClass(activeFormats.blockquote)}>
        <LuTextQuote  />
      </Button>

      <TableGridSelector onInsert={(rows, cols) => { if (editorView) formats.table(editorView, rows, cols); }} />

      <div className={`w-px h-6 ${dividerColor} mx-1`} />

      <Button variant="secondary" iconOnly onClick={() => applyFormat(formats.link)} title="Link (Ctrl+K)">
        <LuLink2  />
      </Button>
      <Button variant="secondary" iconOnly onClick={() => applyFormat(formats.inlineCode)} title="Inline Code (Ctrl+`)" className={getButtonClass(activeFormats.code)}>
        <LuCode  />
      </Button>
      <div className={`w-px h-6 ${dividerColor} mx-1`} />

      <Button variant="secondary" iconOnly onClick={toggleLineWrap} title="Word Wrap (Alt+Z)" className={getButtonClass(lineWrap)}>
        <LuWrapText  />
      </Button>

      <div className="flex-1" />
      
      <Button variant="secondary" iconOnly onClick={toggleTheme} title="Toggle Theme">
        {theme === 'dark' ? <LuSun  /> : <LuMoon  />}
      </Button>
    </div>
  );
}
