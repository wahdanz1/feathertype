import { Tab as TabType } from '../types';
import { useEditorStore } from '../store/useEditorStore';

interface TabProps {
  tab: TabType;
  isActive: boolean;
  index: number;
  onSelect: () => void;
  onClose: () => void;
}

export function Tab({ tab, isActive, index, onSelect, onClose }: TabProps) {
  const theme = useEditorStore((s) => s.theme);

  const isDark = theme === 'dark';

  const styles = isDark ? {
    active: 'bg-[#1e1e1e] text-white border-x border-t border-[#3e3e42] z-10 -mb-[1px] rounded-t-lg shadow-sm font-medium',
    inactive: 'bg-transparent text-gray-500 hover:bg-white/5 border-transparent font-medium',
    closeHover: 'hover:text-red-500',
  } : {
    active: 'bg-white text-gray-900 border-x border-t border-[#d0d0d0] z-10 -mb-[1px] rounded-t-lg shadow-sm font-medium',
    inactive: 'bg-transparent text-gray-500 hover:bg-black/5 border-transparent font-medium',
    closeHover: 'hover:text-red-500',
  };

  const currentStyle = isActive ? styles.active : styles.inactive;

  return (
    <div
      onClick={onSelect}
      className={`
        px-3.5 h-full min-w-[120px] max-w-[200px] flex items-center justify-between gap-3 cursor-pointer
        relative transition-all duration-150 group mx-[2px]
        ${currentStyle}
        ${!isActive ? 'hover:rounded-t-lg' : ''}
      `}
    >
      {/* Visual Separator for inactive tabs, hidden for the first tab */}
      {!isActive && index > 0 && (
        <div className={`absolute -left-[2px] w-[1px] h-4 top-1/2 -translate-y-1/2 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
      )}
      
      <div className="flex items-center gap-2 overflow-hidden">
        {/* Fixed-width container for status dot to prevent horizontal jumping */}
        <div className="w-1.5 flex-shrink-0 flex items-center justify-start">
          {tab.isDirty && (
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" title="Unsaved changes" />
          )}
        </div>
        <span className="text-sm truncate select-none leading-none">{tab.title}</span>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className={`flex items-center justify-center w-5 h-5 text-gray-500 ${styles.closeHover} transition-colors rounded hover:bg-white/10 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}
        title="Close"
      >
        <span className="text-lg" style={{ marginTop: '-2px' }}>×</span>
      </button>
    </div>
  );
}
