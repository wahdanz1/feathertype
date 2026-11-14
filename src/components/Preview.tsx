import { memo, useDeferredValue, useEffect, useState, type ComponentProps, type MouseEvent } from 'react';
import ReactMarkdown, { type Components, type ExtraProps } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEditorStore } from '../store/useEditorStore';
import { isOpenableUrl, openExternal } from '../lib/externalLinks';
import { isTauri } from '../utils/fileOperations';

// A full Markdown render of a large document costs more than a keystroke budget,
// so the preview waits for a typing pause instead of rendering every key.
const RENDER_DELAY_MS = 150;

const remarkPlugins = [remarkGfm];

function PreviewLink({ node: _node, href, ...rest }: ComponentProps<'a'> & ExtraProps) {
  if (href?.startsWith('#')) return <a {...rest} href={href} />;
  // No href at all, so neither a click nor the webview's own new-window handling can leave the app.
  if (!href || !isOpenableUrl(href)) return <a {...rest} />;
  if (!isTauri()) return <a {...rest} href={href} target="_blank" rel="noopener noreferrer" />;

  const open = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    openExternal(href);
  };
  const openOnMiddleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button === 1) open(event);
  };
  return <a {...rest} href={href} onClick={open} onAuxClick={openOnMiddleClick} />;
}

const components: Components = { a: PreviewLink };

const Markdown = memo(function Markdown({ source }: { source: string }) {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {source}
    </ReactMarkdown>
  );
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
