import { FileMenu } from './FileMenu';
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
      <div className="flex-1" />
      <Button
        variant="secondary"
        iconOnly
        onClick={toggleTheme}
        title="Toggle Theme"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {theme === 'dark' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          )}
        </svg>
      </Button>
    </div>
  );
}
