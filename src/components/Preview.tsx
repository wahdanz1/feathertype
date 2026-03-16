import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEditorStore } from '../store/useEditorStore';

export function Preview() {
  const activeTab = useEditorStore((s) => s.getActiveTab());

  if (!activeTab) {
    return null;
  }

  return (
    <div className="markdown-preview overflow-auto h-full bg-[var(--color-editor-bg)] text-gray-200">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {activeTab.content}
      </ReactMarkdown>
    </div>
  );
}
