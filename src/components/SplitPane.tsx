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
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {showPreview ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            )}
          </svg>
        </Button>
      </div>
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
