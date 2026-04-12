import { useEditorStore } from '../store/useEditorStore';
import { LuExternalLink, LuDownload, LuMessageSquare } from 'react-icons/lu';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { Stack } from './ui/Layout';
import { Caption, Subtle } from './ui/Typography';
import { isTauri } from '../utils/fileOperations';
import { APP_NAME, APP_VERSION, LINKS } from '../config';

export function AboutDialog() {
  const isOpen = useEditorStore((s) => s.showAboutDialog);
  const setShowAboutDialog = useEditorStore((s) => s.setShowAboutDialog);

  if (!isTauri()) return null;

  const handleClose = () => setShowAboutDialog(false);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={`About ${APP_NAME}`}
      footer={
        <Caption as="p" variant="muted" className="text-center w-full">
          © 2026-{new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </Caption>
      }
    >
      <Stack align="center" gap={4} className="text-center">
        <img src="/feathertype-logo.svg" alt="FeatherType" className="h-16 w-16" />

        <Stack align="center" gap={1}>
          <h2>{APP_NAME}</h2>
          <p className="text-sm font-medium text-theme-primary">Version {APP_VERSION}</p>
        </Stack>

        <Subtle className="max-w-xs">
          A minimalist, distraction-free markdown editor
          crafted for speed and elegance.
        </Subtle>

        <Stack gap={3} align="stretch" className="w-full mt-4">
          <Button variant="secondary" onClick={() => window.open(LINKS.website, '_blank')}>
            <LuExternalLink size={16} />
            Visit Website
          </Button>
          <Button variant="secondary" onClick={() => window.open(LINKS.download, '_blank')}>
            <LuDownload size={16} />
            Check for Updates
          </Button>
          <Button variant="primary" onClick={() => window.open(LINKS.feedback, '_blank')}>
            <LuMessageSquare size={16} />
            Send Feedback
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
}
