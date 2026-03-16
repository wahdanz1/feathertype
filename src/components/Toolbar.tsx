import { FileMenu } from './FileMenu';
import { useEditorStore } from '../store/useEditorStore';

export function Toolbar() {
  const togglePreview = useEditorStore((s) => s.togglePreview);
  const showPreview = useEditorStore((s) => s.showPreview);
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
      <button
        onClick={toggleTheme}
        className={`px-3 py-1 text-sm rounded transition-colors ${
          theme === 'dark'
            ? 'bg-[#3e3e42] hover:bg-[#4e4e52] text-gray-300'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}
        title="Toggle Theme"
      >
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>
      <button
        onClick={togglePreview}
        className={`px-3 py-1 text-sm rounded transition-colors ${
          showPreview
            ? 'bg-[#0e639c] hover:bg-[#1177bb] text-white'
            : theme === 'dark'
            ? 'bg-[#3e3e42] hover:bg-[#4e4e52] text-gray-300'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}
        title="Toggle Preview (Ctrl+\)"
      >
        {showPreview ? 'Hide Preview' : 'Show Preview'}
      </button>
    </div>
  );
}
