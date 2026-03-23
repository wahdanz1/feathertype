import { Sun, Moon } from 'lucide-react';
import { FileMenu } from './FileMenu';
import { SettingsMenu } from './SettingsMenu';
import { Button } from './Button';
import { useEditorStore } from '../store/useEditorStore';

export function Toolbar() {
  const toggleTheme = useEditorStore((s) => s.toggleTheme);
  const theme = useEditorStore((s) => s.theme);

  return (
    <div className={`flex items-center gap-2 px-3 py-2 border-b ${
      theme === 'dark'
        ? 'bg-[#252526] border-[#3e3e42]'
        : 'bg-[#f5f5f5] border-gray-300'
    }`}>
      <FileMenu />
      <SettingsMenu />
      <div className="flex-1" />
      <Button
        variant="secondary"
        iconOnly
        onClick={toggleTheme}
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </Button>
    </div>
  );
}
