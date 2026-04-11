import { useState } from 'react';
import { Page, Section, Stack, Flex } from '../components/ui/Layout';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/SectionHeader';
import { ActionLink } from '../components/ui/ActionLink';
import { Subtle } from '../components/ui/Typography';
import { IconBox } from '../components/ui/IconBox';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { BulletList } from '../components/ui/BulletList';
import { AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/Accordion';
import { RELEASES } from '../data/releases';
import {
  LuDownload,
  LuMonitor,
  LuHistory,
  LuChevronDown,
  LuChevronUp
} from 'react-icons/lu';



export default function Download() {
  return (
    <Page>
      <HeroSection />
      <HistorySection />
    </Page>
  );
}

function HeroSection() {
  return (
    <Section size="lg" animate="slide-up">
      <Flex gap={12} items="start" className="flex-col md:flex-row">
        <Stack gap={6} className="flex-1">
          <h1>
            Get <span className="text-theme-primary">FeatherType.</span>
          </h1>
          <p className="lead max-w-xl">
            Experience the lightest way to write. Available for desktop power or quick browser access.
          </p>
        </Stack>

        <GlassCard variant="gradient" border="subtle" className="w-full md:w-64">
          <Stack gap={6} align="stretch">
            <Flex gap={4}>
              <IconBox icon={<LuMonitor />} variant="primary" className="text-theme-accent" />
              <Stack gap={1}>
                <h3>Latest Stable</h3>
                <Badge label="v1.0.0 • Windows" variant="outline" />
              </Stack>
            </Flex>

            <Stack gap={3} align="stretch">
              <Button
                size="lg"
                variant="primary"
                fullWidth
                animateIcon="vertical"
                disabled
              >
                Download
                <LuDownload size={20} />
              </Button>
              <Subtle className="text-center">
                Universal .exe (8.4MB)
              </Subtle>
            </Stack>
          </Stack>
        </GlassCard>
      </Flex>
    </Section>
  );
}


function HistorySection() {
  return (
    <Section id="releases" size="lg" className="pb-24">
      <Stack gap={8} align="stretch">
        <SectionHeader
          title="Release History"
          icon={<LuHistory />}
          center={false}
          className="mb-8"
        />

        <Stack gap={4} align="stretch">
          {RELEASES.map((rel) => (
            <ReleaseItem key={rel.version} rel={rel} />
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}

function ReleaseItem({ rel }: { rel: (typeof RELEASES)[0] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AccordionItem 
      isOpen={isOpen} 
      onToggle={() => setIsOpen(!isOpen)}
      activeIndicator={<StatusIndicator active={isOpen} />}
    >
      <AccordionTrigger>
        <Flex justify="between" gap={4}>
          <Stack gap={1}>
            <Flex gap={3}>
              <h4 className="text-xl font-bold">v{rel.version}</h4>
              <Badge label={rel.type} variant="success" />
            </Flex>
            <Subtle>{rel.date}</Subtle>
          </Stack>

          <Flex gap={4}>
            <ActionLink
              as="span"
              variant="meta"
              icon={isOpen ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
            >
              {isOpen ? 'Close' : 'View Changes'}
            </ActionLink>

            <Button size="sm" variant="secondary" className="hidden sm:flex px-4" disabled>
              Download
            </Button>
          </Flex>
        </Flex>
      </AccordionTrigger>

      <AccordionContent>
        <BulletList items={rel.changes} cols={2} />

        <Stack divider className="mt-8 pt-8 sm:hidden">
          <Button size="lg" variant="secondary" fullWidth disabled>
            Download Version
          </Button>
        </Stack>
      </AccordionContent>
    </AccordionItem>
  );
}
