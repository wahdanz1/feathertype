import { Editor } from './Editor';
import { Preview } from './Preview';
import { useEditorStore } from '../store/useEditorStore';

export function SplitPane() {
  const showPreview = useEditorStore((s) => s.showPreview);

  return (
    <div className="flex flex-row h-full">
      <div className={showPreview ? 'w-1/2 h-full' : 'w-full h-full'}>
        <Editor />
      </div>
      {showPreview && (
        <>
          <div className="w-px bg-[var(--color-border)]" />
          <div className="w-1/2 h-full overflow-hidden">
            <Preview />
          </div>
        </>
      )}
    </div>
  );
}
