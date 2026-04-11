import { useState, useRef, useEffect } from 'react';
import { LuMenu } from 'react-icons/lu';
import { useEditorStore } from '../store/useEditorStore';
import { openFileDialog, openAndReadFile, getFileName, handleSaveFile, handleSaveAsFile, exportAsDocx, isTauri } from '../utils/fileOperations';
import { Button } from './Button';
import { cn } from '../lib/utils';
import { APP_NAME } from '../config';

export function FileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const addTab = useEditorStore((s) => s.addTab);
  const getActiveTab = useEditorStore((s) => s.getActiveTab);
  const updateTabPath = useEditorStore((s) => s.updateTabPath);
  const markTabClean = useEditorStore((s) => s.markTabClean);
  const theme = useEditorStore((s) => s.theme);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const handleNew = () => { addTab(); close(); };

  const handleOpen = async () => {
    try {
      const path = await openFileDialog();
      if (path !== null) {
        const content = await openAndReadFile(path as string | File);
        const title = getFileName(path);
        addTab({ filePath: path, content, title, isDirty: false });
      }
    } catch (error) {
      console.error('Failed to open file:', error);
      alert('Failed to open file: ' + error);
    }
    close();
  };

  const handleSave = async () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;
    await handleSaveFile(activeTab, markTabClean, updateTabPath);
    close();
  };

  const handleSaveAs = async () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;
    await handleSaveAsFile(activeTab, markTabClean, updateTabPath);
    close();
  };

  const handleExportDocx = async () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;
    await exportAsDocx(activeTab.content, activeTab.filePath as string | File | null);
    close();
  };

  const itemClass = cn(
    "w-full px-4 py-2 text-left text-sm transition-colors flex justify-between items-center",
    isDark ? "hover:bg-editor-surface-raised" : "hover:bg-button-inactive-light"
  );

  const dividerClass = cn("border-t my-1", isDark ? "border-border" : "border-border-light");

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="primary" iconOnly onClick={() => setIsOpen(!isOpen)} title="File menu">
        <LuMenu className="w-6 h-6" />
      </Button>

      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 mt-1 border rounded shadow-xl min-w-[200px] z-50 py-1",
          isDark ? "bg-editor-surface border-border" : "bg-editor-bg-light border-border-light"
        )}>
          <MenuItem label="New" shortcut="Ctrl+N" onClick={handleNew} className={itemClass} />
          <MenuItem label="Open" shortcut="Ctrl+O" onClick={handleOpen} className={itemClass} />
          <div className={dividerClass} />
          <MenuItem label="Save" shortcut="Ctrl+S" onClick={handleSave} className={itemClass} />
          <MenuItem label="Save As" shortcut="Ctrl+Shift+S" onClick={handleSaveAs} className={itemClass} />
          <div className={dividerClass} />
          <MenuItem label="Export as DOCX" onClick={handleExportDocx} className={itemClass} />
          {isTauri() && (
            <>
              <div className={dividerClass} />
              <MenuItem
                label={`About ${APP_NAME}`}
                onClick={() => { useEditorStore.getState().setShowAboutDialog(true); close(); }}
                className={itemClass}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, shortcut, onClick, className }: {
  label: string;
  shortcut?: string;
  onClick: () => void;
  className: string;
}) {
  return (
    <button onClick={onClick} className={className}>
      <span>{label}</span>
      {shortcut && <span className="text-xs text-theme-text-muted ml-6">{shortcut}</span>}
    </button>
  );
}
