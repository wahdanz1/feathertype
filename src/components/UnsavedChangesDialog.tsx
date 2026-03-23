import { Tab } from '../types';
import { useEditorStore } from '../store/useEditorStore';

interface UnsavedChangesDialogProps {
  tab: Tab;
  onContinueEditing: () => void;
  onDiscardChanges: () => void;
  onSaveAndClose: () => void;
}

export function UnsavedChangesDialog({
  tab,
  onContinueEditing,
  onDiscardChanges,
  onSaveAndClose,
}: UnsavedChangesDialogProps) {
  const theme = useEditorStore((s) => s.theme);

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`border rounded-lg shadow-xl p-6 min-w-[400px] ${
        isDark
          ? 'bg-[#252526] border-[#3e3e42] text-gray-200'
          : 'bg-white border-gray-300 text-gray-900'
      }`}>
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold mb-1">Unsaved Changes</h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {tab.title} has unsaved changes.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onContinueEditing}
            autoFocus
            className={`px-3 py-1.5 text-sm rounded border transition-colors ${
              isDark
                ? 'border-[#3e3e42] bg-[#2d2d2d] hover:bg-[#3e3e42] text-gray-200'
                : 'border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            Continue editing
          </button>
          <button
            onClick={onDiscardChanges}
            className={`px-3 py-1.5 text-sm rounded border transition-colors ${
              isDark
                ? 'border-[#3e3e42] bg-[#2d2d2d] hover:border-red-500 hover:bg-[#3e3e42] text-gray-200'
                : 'border-gray-300 bg-gray-100 hover:border-red-500 hover:bg-gray-200 text-gray-800'
            }`}
          >
            Discard changes
          </button>
          <button
            onClick={onSaveAndClose}
            className="px-3 py-1.5 text-sm rounded border border-blue-600 bg-blue-700 hover:bg-blue-600 text-white transition-colors"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
