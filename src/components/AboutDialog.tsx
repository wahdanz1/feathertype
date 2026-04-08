import { useEditorStore } from '../store/useEditorStore';
import { ExternalLink, Download, MessageSquare } from 'lucide-react';
import { Dialog } from './Dialog';
import { Button } from './Button';

export function AboutDialog() {
  const isOpen = useEditorStore((s) => s.showAboutDialog);
  const setShowAboutDialog = useEditorStore((s) => s.setShowAboutDialog);

  const handleClose = () => setShowAboutDialog(false);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="About FeatherType"
      footer={
        <div className="flex flex-col items-center justify-center w-full gap-1">
          <p className="text-[10px] text-gray-200 opacity-60">
            © 2026 FeatherType. All rights reserved.
          </p>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-theme-primary flex items-center justify-center shadow-lg mb-4">
          <svg viewBox="0 0 24 24" className="w-12 h-12 text-white fill-current">
            <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.08-.34.12-.57.12s-.41-.04-.57-.12l-7.9-4.44A1.01 1.01 0 013 16.5V7.5c0-.38.21-.71.53-.88l7.9-4.44c.16-.08.34-.12.57-.12s.41.04.57.12l7.9 4.44c.32.17.53.5.53.88v9z" />
          </svg>
        </div>

        <h2 className="text-2xl font-black tracking-tight">FeatherType</h2>
        <p className="text-sm font-medium text-theme-primary mb-6">Version 1.0.0</p>

        <p className="text-sm leading-relaxed mb-8 text-gray-500 dark:text-gray-400">
          A minimalist, distraction-free markdown editor <br />
          crafted for speed and elegance.
        </p>

        <div className="grid grid-cols-1 gap-3 w-full">
          <Button variant="secondary" onClick={() => window.open('#', '_blank')}>
            <ExternalLink size={16} className="mr-2" />
            Visit Website
          </Button>
          <Button variant="secondary" onClick={() => window.open('https://feathertype.vercel.app/', '_blank')}>
            <Download size={16} className="mr-2" />
            Check for Updates
          </Button>
          <Button variant="primary" onClick={() => window.open('#', '_blank')}>
            <MessageSquare size={16} className="mr-2" />
            Send Feedback
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
