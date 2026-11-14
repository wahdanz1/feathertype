import { memo, useDeferredValue, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEditorStore } from '../store/useEditorStore';

// A full Markdown render of a large document costs more than a keystroke budget,
// so the preview waits for a typing pause instead of rendering every key.
const RENDER_DELAY_MS = 150;

const remarkPlugins = [remarkGfm];

const Markdown = memo(function Markdown({ source }: { source: string }) {
  return <ReactMarkdown remarkPlugins={remarkPlugins}>{source}</ReactMarkdown>;
});

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function TabPreview({ tabId }: { tabId: string }) {
  const content = useEditorStore((s) => s.tabs.find((t) => t.id === tabId)?.content ?? '');
  const source = useDeferredValue(useDebouncedValue(content, RENDER_DELAY_MS));
  return <Markdown source={source} />;
}

export function Preview() {
  const activeTabId = useEditorStore((s) => s.activeTabId);

  if (!activeTabId) {
    return null;
  }

  return (
    <div className="markdown-preview preview-pane text-secondary">
      <TabPreview key={activeTabId} tabId={activeTabId} />
    </div>
  );
}
