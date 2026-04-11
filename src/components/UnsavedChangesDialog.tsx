import { useEditorStore } from '../store/useEditorStore';
import { Dialog, DialogAction } from './Dialog';
import { LuTriangleAlert, LuUndo2, LuTrash2, LuSave } from 'react-icons/lu';

export function UnsavedChangesDialog() {
  const isOpen = useEditorStore((s) => s.unsavedChangesDialog.isOpen);
  const tab = useEditorStore((s) => s.getUnsavedTab());
  const onContinueEditing = useEditorStore((s) => s.cancelCloseTab);
  const onDiscardChanges = useEditorStore((s) => s.confirmCloseTab);
  const onSaveAndClose = useEditorStore((s) => s.saveAndCloseTab);

  if (!isOpen || !tab) return null;

  const actions: DialogAction[] = [
    { label: 'Cancel', icon: <LuUndo2 size={16} />, variant: 'secondary', onClick: onContinueEditing },
    { label: 'Discard', icon: <LuTrash2 size={16} />, variant: 'destructive', onClick: onDiscardChanges },
    { label: 'Save', icon: <LuSave size={16} />, variant: 'primary', onClick: onSaveAndClose },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onContinueEditing}
      title="Unsaved Changes"
      description={`"${tab.title}" has unsaved changes. Do you want to save them before closing?`}
      icon={<LuTriangleAlert />}
      actions={actions}
    />
  );
}
