import { useState, useRef, useEffect, useId } from 'react';
import { LuMenu } from 'react-icons/lu';
import { useEditorStore } from '../store/useEditorStore';
import { exportAsDocx } from '../utils/fileOperations';
import { isTauri } from '../lib/platform';
import { appCommands, shortcutHint } from '../utils/shortcuts';
import { useMenu } from '../hooks/usePopup';
import { Button } from './Button';
import { APP_NAME } from '../config';

const exportActiveTab = async () => {
  const activeTab = useEditorStore.getState().getActiveTab();
  if (activeTab) await exportAsDocx(activeTab);
};

const showAbout = () => useEditorStore.getState().setShowAboutDialog(true);

export function FileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  useEditorStore((s) => s.theme); // subscribe for light-theme CSS reactivity

  const close = () => setIsOpen(false);
  useMenu(menuRef, isOpen, close);

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

  const run = (command: () => unknown) => () => {
    close();
    void command();
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="primary"
        iconOnly
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        title="File menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
      >
        <LuMenu />
      </Button>

      {isOpen && (
        <div id={menuId} role="menu" aria-label="File" className="panel absolute top-full left-0 mt-1 min-w-[200px] z-50 py-1">
          <MenuItem label="New" shortcut={shortcutHint('new')} onClick={run(appCommands.new)} />
          <MenuItem label="Open" shortcut={shortcutHint('open')} onClick={run(appCommands.open)} />
          <div role="separator" className="menu-divider" />
          <MenuItem label="Save" shortcut={shortcutHint('save')} onClick={run(appCommands.save)} />
          <MenuItem label="Save As" shortcut={shortcutHint('saveAs')} onClick={run(appCommands.saveAs)} />
          <div role="separator" className="menu-divider" />
          <MenuItem label="Export as DOCX" onClick={run(exportActiveTab)} />
          {isTauri() && (
            <>
              <div role="separator" className="menu-divider" />
              <MenuItem label={`About ${APP_NAME}`} onClick={run(showAbout)} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, shortcut, onClick }: {
  label: string;
  shortcut?: string;
  onClick: () => void;
}) {
  return (
    <button role="menuitem" tabIndex={-1} onClick={onClick} className="menu-item">
      <span>{label}</span>
      {shortcut && <span className="text-xs text-theme-text-muted ml-6">{shortcut}</span>}
    </button>
  );
}
