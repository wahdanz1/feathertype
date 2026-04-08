import { useEditorStore } from '../store/useEditorStore';
import { Undo2, Trash2, Save } from 'lucide-react';

export function UnsavedChangesDialog() {
  const isOpen = useEditorStore((s) => s.unsavedChangesDialog.isOpen);
  const tab = useEditorStore((s) => s.getUnsavedTab());
  const onContinueEditing = useEditorStore((s) => s.cancelCloseTab);
  const onDiscardChanges = useEditorStore((s) => s.confirmCloseTab);
  const onSaveAndClose = useEditorStore((s) => s.saveAndCloseTab);
  const theme = useEditorStore((s) => s.theme);

  if (!isOpen || !tab) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className={`w-full max-w-md p-6 rounded-lg shadow-xl border ${
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
            <h3 className="text-lg font-bold">Unsaved Changes</h3>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              "{tab.title}" has unsaved changes. Do you want to save them before closing?
            </p>
          </div>
        </div>
        
        <div className="flex flex-row flex-wrap gap-2 mt-6 justify-end">
          <button
            onClick={() => onContinueEditing()}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors whitespace-nowrap ${
              isDark
                ? 'border-[#3e3e42] bg-[#2d2d2d] hover:bg-[#3e3e42] text-gray-200'
                : 'border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <Undo2 size={16} />
            Cancel
          </button>
          
          <button
            onClick={() => onDiscardChanges()}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors whitespace-nowrap ${
              isDark
                ? 'border-[#3e3e42] bg-[#2d2d2d] hover:bg-red-900/30 hover:border-red-900/50 hover:text-red-400'
                : 'border-gray-300 bg-gray-100 hover:bg-red-100 hover:border-red-200 hover:text-red-700'
            }`}
          >
            <Trash2 size={16} />
            Discard
          </button>
          
          <button
            onClick={() => onSaveAndClose()}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md border transition-colors whitespace-nowrap ${
              isDark
                ? 'bg-blue-600 border-blue-500 hover:bg-blue-500'
                : 'bg-blue-600 border-blue-500 hover:bg-blue-500'
            }`}
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
