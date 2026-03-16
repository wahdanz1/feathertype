import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { openFileDialog, saveFileDialog, readFile, writeFile, getFileName } from '../utils/fileOperations';
import { Button } from './Button';

export function FileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const addTab = useEditorStore((s) => s.addTab);
  const getActiveTab = useEditorStore((s) => s.getActiveTab);
  const updateTabPath = useEditorStore((s) => s.updateTabPath);
  const markTabClean = useEditorStore((s) => s.markTabClean);
  const theme = useEditorStore((s) => s.theme);
  const toggleLineWrap = useEditorStore((s) => s.toggleLineWrap);
  const lineWrap = useEditorStore((s) => s.lineWrap);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNew = () => {
    addTab();
    setIsOpen(false);
  };

  const handleOpen = async () => {
    try {
      const path = await openFileDialog();
      if (path) {
        const content = await readFile(path);
        const title = getFileName(path);
        addTab({ filePath: path, content, title, isDirty: false });
      }
    } catch (error) {
      console.error('Failed to open file:', error);
      alert('Failed to open file: ' + error);
    }
    setIsOpen(false);
  };

  const handleSave = async () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;

    try {
      if (activeTab.filePath) {
        await writeFile(activeTab.filePath, activeTab.content);
        markTabClean(activeTab.id);
      } else {
        await handleSaveAs();
        return;
      }
    } catch (error) {
      console.error('Failed to save file:', error);
      alert('Failed to save file: ' + error);
    }
    setIsOpen(false);
  };

  const handleSaveAs = async () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;

    try {
      const path = await saveFileDialog(activeTab.filePath || undefined);
      if (path) {
        await writeFile(path, activeTab.content);
        const title = getFileName(path);
        updateTabPath(activeTab.id, path, title);
        markTabClean(activeTab.id);
      }
    } catch (error) {
      console.error('Failed to save file:', error);
      alert('Failed to save file: ' + error);
    }
    setIsOpen(false);
  };

  const handleToggleLineWrap = () => {
    toggleLineWrap();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="primary"
        iconOnly
        onClick={() => setIsOpen(!isOpen)}
        title="File menu"
      >
        <span className="w-4 h-4 flex items-center justify-center text-sm leading-none">☰</span>
      </Button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-1 border rounded shadow-lg min-w-[160px] z-50 ${
          theme === 'dark' 
            ? 'bg-[#252526] border-[#3e3e42]' 
            : 'bg-white border-gray-300'
        }`}>
          <button
            onClick={handleNew}
            className={`w-full px-4 py-2 text-left text-sm transition-colors flex justify-between items-center ${
              theme === 'dark' ? 'hover:bg-[#2a2d2e]' : 'hover:bg-gray-100'
            }`}
          >
            <span>New</span>
            <span className="text-xs text-gray-400">Ctrl+N</span>
          </button>
          <button
            onClick={handleOpen}
            className={`w-full px-4 py-2 text-left text-sm transition-colors flex justify-between items-center ${
              theme === 'dark' ? 'hover:bg-[#2a2d2e]' : 'hover:bg-gray-100'
            }`}
          >
            <span>Open</span>
            <span className="text-xs text-gray-400">Ctrl+O</span>
          </button>
          <div className={`border-t my-1 ${theme === 'dark' ? 'border-[#3e3e42]' : 'border-gray-300'}`}></div>
          <button
            onClick={handleSave}
            className={`w-full px-4 py-2 text-left text-sm transition-colors flex justify-between items-center ${
              theme === 'dark' ? 'hover:bg-[#2a2d2e]' : 'hover:bg-gray-100'
            }`}
          >
            <span>Save</span>
            <span className="text-xs text-gray-400">Ctrl+S</span>
          </button>
          <button
            onClick={handleSaveAs}
            className={`w-full px-4 py-2 text-left text-sm transition-colors flex justify-between items-center ${
              theme === 'dark' ? 'hover:bg-[#2a2d2e]' : 'hover:bg-gray-100'
            }`}
          >
            <span>Save As</span>
            <span className="text-xs text-gray-400">Ctrl+Shift+S</span>
          </button>
          <div className={`border-t my-1 ${theme === 'dark' ? 'border-[#3e3e42]' : 'border-gray-300'}`}></div>
          <button
            onClick={handleToggleLineWrap}
            className={`w-full px-4 py-2 text-left text-sm transition-colors flex justify-between items-center ${
              theme === 'dark' ? 'hover:bg-[#2a2d2e]' : 'hover:bg-gray-100'
            }`}
          >
            <span>{lineWrap ? '✓ ' : ''}Word Wrap</span>
            <span className="text-xs text-gray-400">Alt+Z</span>
          </button>
        </div>
      )}
    </div>
  );
}
