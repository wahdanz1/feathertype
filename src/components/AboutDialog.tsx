import { useEditorStore } from '../store/useEditorStore';
import { LuExternalLink, LuDownload, LuMessageSquare } from 'react-icons/lu';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { Stack } from './ui/Layout';
import { Subtle } from './ui/Typography';
import { isTauri } from '../utils/fileOperations';

export function AboutDialog() {
  const isOpen = useEditorStore((s) => s.showAboutDialog);
  const setShowAboutDialog = useEditorStore((s) => s.setShowAboutDialog);

  if (!isTauri()) return null;

  const handleClose = () => setShowAboutDialog(false);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="About FeatherType"
      footer={
        <Subtle as="p" className="text-center w-full text-[10px] opacity-60">
          © 2026 FeatherType. All rights reserved.
        </Subtle>
      }
    >
      <Stack align="center" gap={4} className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-theme-primary flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 24 24" className="w-12 h-12 text-white fill-current">
            <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.08-.34.12-.57.12s-.41-.04-.57-.12l-7.9-4.44A1.01 1.01 0 013 16.5V7.5c0-.38.21-.71.53-.88l7.9-4.44c.16-.08.34-.12.57-.12s.41.04.57.12l7.9 4.44c.32.17.53.5.53.88v9z" />
          </svg>
        </div>

        <Stack align="center" gap={1}>
          <h2 className="text-2xl font-black tracking-tight">FeatherType</h2>
          <p className="text-sm font-medium text-theme-primary">Version 1.0.0</p>
        </Stack>

        <Subtle className="max-w-xs">
          A minimalist, distraction-free markdown editor
          crafted for speed and elegance.
        </Subtle>

        <Stack gap={3} align="stretch" className="w-full mt-4">
          <Button variant="secondary" onClick={() => window.open('#', '_blank')}>
            <LuExternalLink size={16} className="mr-2" />
            Visit Website
          </Button>
          <Button variant="secondary" onClick={() => window.open('https://feathertype.vercel.app/', '_blank')}>
            <LuDownload size={16} className="mr-2" />
            Check for Updates
          </Button>
          <Button variant="primary" onClick={() => window.open('#', '_blank')}>
            <LuMessageSquare size={16} className="mr-2" />
            Send Feedback
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
}
