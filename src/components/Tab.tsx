import { Tab as TabType } from '../types';
import { useEditorStore } from '../store/useEditorStore';

interface TabProps {
  tab: TabType;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}

export function Tab({ tab, isActive, onSelect, onClose }: TabProps) {
  const theme = useEditorStore((s) => s.theme);

  const darkColors = {
    active: 'bg-[#2d2d2d]',
    inactive: 'bg-[#252526]',
    hover: 'hover:bg-[#2d2d2d]',
    border: 'border-[#3e3e42]',
    text: 'text-gray-200',
    closeHover: 'hover:text-white',
  };

  const lightColors = {
    active: 'bg-white',
    inactive: 'bg-[#f5f5f5]',
    hover: 'hover:bg-white',
    border: 'border-[#d0d0d0]',
    text: 'text-gray-900',
    closeHover: 'hover:text-black',
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <div
      onClick={onSelect}
      className={`
        px-4 py-2 flex items-center gap-2 cursor-pointer
        border-r ${colors.border}
        ${isActive ? colors.active : colors.inactive}
        ${colors.hover}
        ${colors.text}
        transition-colors
      `}
    >
      <span className="text-sm">{tab.title}</span>
      {tab.isDirty && (
        <span className="w-2 h-2 bg-blue-500 rounded-full" title="Unsaved changes" />
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className={`ml-2 text-gray-400 ${colors.closeHover} transition-colors`}
        title="Close"
      >
        ×
      </button>
    </div>
  );
}
