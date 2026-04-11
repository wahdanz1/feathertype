import { LuEye, LuEyeOff } from 'react-icons/lu';
import { Editor } from './Editor';
import { Preview } from './Preview';
import { Button } from './Button';
import { useEditorStore } from '../store/useEditorStore';

export function SplitPane() {
  const showPreview = useEditorStore((s) => s.showPreview);
  const togglePreview = useEditorStore((s) => s.togglePreview);

  return (
    <div className="flex flex-row h-full relative">
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant={showPreview ? 'primary' : 'secondary'}
          iconOnly
          onClick={togglePreview}
          title="Toggle Preview (Ctrl+\)"
        >
          {showPreview ? <LuEye className="w-6 h-6" /> : <LuEyeOff className="w-6 h-6" />}
        </Button>
      </div>
      <div className={showPreview ? 'w-1/2 h-full overflow-hidden' : 'w-full h-full overflow-hidden'}>
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
