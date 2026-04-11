import { LuFileText } from 'react-icons/lu';
import { GlassCard } from '../GlassCard';
import { Stack, Flex } from '../ui/Layout';
import { Caption } from '../ui/Typography';
import { Spacer } from '../ui/Spacer';

function TrafficLights() {
  return (
    <Flex gap={2}>
      <div className="h-3 w-3 rounded-full bg-red-400/30" />
      <div className="h-3 w-3 rounded-full bg-yellow-400/30" />
      <div className="h-3 w-3 rounded-full bg-green-400/30" />
    </Flex>
  );
}

export function EditorMockup() {
  return (
    <GlassCard
      variant="default"
      padding="none"
      rounded="2xl"
      overflow="hidden"
      hoverable={false}
      className="mockup-frame"
    >
      <Flex justify="between" className="mockup-titlebar">
        <TrafficLights />
        <Caption as="div" variant="muted" className="flex items-center gap-2">
          <LuFileText size={12} />
          FeatherType Editor
        </Caption>
        <Spacer width={12} height={4} />
      </Flex>

      <Flex items="stretch" className="bg-gradient-to-b from-editor-bg to-editor-bg-deep min-h-[400px]">
        <Stack gap={6} className="mockup-pane mockup-code">
          <Flex gap={4}>
            <span className="text-theme-primary">#</span>
            <span className="text-theme-text font-bold">FeatherType Editor</span>
          </Flex>
          <Stack gap={2}>
            <p>Focus on writing, the noise is gone.</p>
            <p>Your ideas deserve a lightweight home.</p>
          </Stack>
          <Stack gap={3}>
            <MockupBullet text="Markdown native support" />
            <MockupBullet text="Local-first privacy" />
            <MockupBullet text="DOCX import and export" />
          </Stack>
        </Stack>

        <Stack gap={6} className="hidden md:flex mockup-pane mockup-preview prose prose-invert prose-sm md:prose-base">
          <h1 className="text-2xl font-bold border-b border-white/10 pb-2">FeatherType Editor</h1>
          <Stack gap={4}>
            <p>Focus on writing, the noise is gone.</p>
            <p>Your ideas deserve a lightweight home.</p>
          </Stack>
          <ul className="list-disc list-inside text-theme-text-secondary decoration-theme-primary">
            <li>Markdown native support</li>
            <li>Local-first privacy</li>
            <li>DOCX import and export</li>
          </ul>
        </Stack>
      </Flex>
    </GlassCard>
  );
}

function MockupBullet({ text }: { text: string }) {
  return (
    <Flex gap={4}>
      <span className="text-theme-primary">-</span>
      <span className="text-theme-text-secondary">{text}</span>
    </Flex>
  );
}
