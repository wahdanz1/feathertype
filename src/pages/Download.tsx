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
import { useReleases, type ReleasesStatus } from '../hooks/useReleases';
import { formatFileSize, RELEASES_PAGE_URL, type ReleaseEntry, type ReleaseTag } from '../lib/releases';
import {
  LuDownload,
  LuMonitor,
  LuHistory,
  LuChevronDown,
  LuChevronUp,
  LuLoader,
  LuMessageCircle,
  LuExternalLink
} from 'react-icons/lu';

const TAG_VARIANTS: Record<ReleaseTag, 'success' | 'info' | 'warning' | 'default'> = {
  'Stable': 'success',
  'Feature': 'info',
  'Bug Fix': 'warning',
  'Improvement': 'default',
  'Beta': 'default',
};

function tagVariant(tag: ReleaseTag) {
  return TAG_VARIANTS[tag] ?? 'default';
}

interface ReleasesProps {
  status: ReleasesStatus;
  latest: ReleaseEntry | null;
}

export default function Download() {
  const { releases, latest, status } = useReleases();

  return (
    <Page>
      <HeroSection status={status} latest={latest} />
      <HistorySection status={status} releases={releases} latest={latest} />
      <FeedbackSection />
    </Page>
  );
}

function HeroSection({ status, latest }: ReleasesProps) {
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
                <Badge label={badgeLabel(status, latest)} variant="outline" />
              </Stack>
            </Flex>

            <HeroDownload status={status} latest={latest} />
          </Stack>
        </GlassCard>
      </Flex>
    </Section>
  );
}

function badgeLabel(status: ReleasesStatus, latest: ReleaseEntry | null) {
  if (latest) return `v${latest.version} • Windows`;
  return status === 'ready' ? 'Coming soon' : 'Windows';
}

function HeroDownload({ status, latest }: ReleasesProps) {
  if (status === 'loading') {
    return (
      <Stack gap={3} align="stretch">
        <Button size="lg" variant="primary" fullWidth disabled title="Checking for releases...">
          <LuLoader size={20} className="animate-spin" />
        </Button>
        <Subtle className="text-center">Checking...</Subtle>
      </Stack>
    );
  }

  if (latest?.asset) {
    return (
      <Stack gap={3} align="stretch">
        <Button to={latest.asset.downloadUrl} size="lg" variant="primary" fullWidth animateIcon="vertical">
          Download
          <LuDownload size={20} />
        </Button>
        <Subtle className="text-center">
          {`${latest.asset.name} (${formatFileSize(latest.asset.size)})`}
        </Subtle>
      </Stack>
    );
  }

  if (status === 'error' || latest) {
    return (
      <Stack gap={3} align="stretch">
        <Button to={RELEASES_PAGE_URL} size="lg" variant="primary" fullWidth>
          Releases
          <LuExternalLink size={20} />
        </Button>
        <Subtle className="text-center">
          {status === 'error' ? "Couldn't load release info. Get the installer on GitHub." : 'Installer not attached yet. Check GitHub.'}
        </Subtle>
      </Stack>
    );
  }

  return (
    <Stack gap={3} align="stretch">
      <Button size="lg" variant="primary" fullWidth disabled title="No releases available yet">
        Download
        <LuDownload size={20} />
      </Button>
      <Subtle className="text-center">No releases yet</Subtle>
    </Stack>
  );
}


function HistorySection({ status, releases, latest }: ReleasesProps & { releases: ReleaseEntry[] }) {

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
          {status === 'loading' ? (
            <Flex justify="center" className="py-12">
              <LuLoader size={24} className="animate-spin text-theme-muted" />
            </Flex>
          ) : status === 'error' ? (
            <Subtle className="py-12">
              Release history couldn't be loaded right now.{' '}
              <ActionLink to={RELEASES_PAGE_URL}>See all releases on GitHub</ActionLink>
            </Subtle>
          ) : releases.length > 0 ? (
            releases.map((rel) => (
              <ReleaseItem key={rel.version} rel={rel} isLatest={rel === latest} />
            ))
          ) : (
            <Subtle className="py-12">No releases yet. Check back soon!</Subtle>
          )}
        </Stack>
      </Stack>
    </Section>
  );
}

function ReleaseItem({ rel, isLatest }: { rel: ReleaseEntry; isLatest: boolean }) {
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
              {rel.tags.map((tag) => (
                <Badge key={tag} label={tag} variant={tagVariant(tag)} />
              ))}
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

            {rel.asset ? (
              <Button
                to={rel.asset.downloadUrl}
                size="sm"
                variant={isLatest ? 'primary' : 'secondary'}
                className="hidden sm:flex px-4"
              >
                Download
              </Button>
            ) : (
              <Button size="sm" variant="secondary" className="hidden sm:flex px-4" disabled>
                Download
              </Button>
            )}
          </Flex>
        </Flex>
      </AccordionTrigger>

      <AccordionContent>
        <BulletList items={rel.changes} cols={2} />

        {rel.asset && (
          <Stack divider className="mt-8 pt-8 sm:hidden">
            <Button to={rel.asset.downloadUrl} size="lg" variant={isLatest ? 'primary' : 'secondary'} fullWidth>
              Download Version
            </Button>
          </Stack>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function FeedbackSection() {
  return (
    <Section id="feedback" size="lg" className="pb-24">
      <GlassCard variant="muted" border="subtle" hoverable={false}>
        <Flex gap={6} className="flex-col sm:flex-row" items="center">
          <IconBox icon={<LuMessageCircle />} variant="primary" size="lg" className="text-theme-accent" />
          <Stack gap={2} className="flex-1 text-center sm:text-left items-center sm:items-start">
            <h3>Got feedback?</h3>
            <Subtle>
              Found a bug, have a feature request, or just want to share your thoughts? Join the discussion on GitHub.
            </Subtle>
          </Stack>
          <Button
            variant="secondary"
            onClick={() => window.open('https://github.com/wahdanz1/feathertype/discussions', '_blank')}
          >
            <LuMessageCircle size={16} />
            Open Discussions
          </Button>
        </Flex>
      </GlassCard>
    </Section>
  );
}
