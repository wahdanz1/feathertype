import { Button } from '../components/Button';
import { SectionHeader } from '../components/SectionHeader';
import { EditorMockup } from '../components/marketing/EditorMockup';
import { CTASection } from '../components/marketing/CTASection';
import { MarketingCard } from '../components/marketing/MarketingCard';
import { Stack, Flex, Grid, Page, Section } from '../components/ui/Layout';
import {
  LuZap,
  LuShield,
  LuCpu,
  LuCloudOff,
  LuArrowRight,
  LuFileText,
  LuLayoutGrid
} from 'react-icons/lu';


export default function Home() {
  return (
    <Page>
      <Section variant="hero" size="md">
        <Stack align="center" gap={8}>
          <h1>
            Focus on <span className="text-theme-primary">writing</span>, <br />
            leave the noise behind.
          </h1>

          <p className="lead max-w-2xl">
            FeatherType is a feather-light Markdown editor built for writers who crave speed,
            minimalism, and local-first control. No distractions, just your words.
          </p>

          <Flex gap={6} className="flex-col sm:flex-row mt-4">
              <Button to="/editor" variant="primary" size="lg" animateIcon>
                 Try Editor Online
                 <LuArrowRight className="ml-2" size={20} />
              </Button>
              <Button to="/download" variant="secondary" size="lg">
                Download for Desktop
              </Button>
          </Flex>
        </Stack>
      </Section>

      <Section className="pb-24">
        <EditorMockup />
      </Section>

      {/* Features Grid */}
      <Section size="xl" className="py-24">
        <SectionHeader
          title={<>Everything you need, <br /> nothing you don't.</>}
          description="Designed for maximum focus and zero friction. We didn't reinvent the wheel, we just made it lighter."
        />

        <Grid cols={3} gap={8} className="mt-16">
          <MarketingCard
            icon={<LuZap />}
            title="Instant Launch"
            description="Start writing in milliseconds. No splash screens, no heavy loading — just you and your words."
          />
          <MarketingCard
            icon={<LuShield />}
            title="Privacy First"
            description="Your documents never leave your device unless you want them to. Complete local encryption."
          />
          <MarketingCard
            icon={<LuCpu />}
            title="Extreme Performance"
            description="Powered by a high-efficiency Rust core for a lag-free experience even with massive files."
          />
          <MarketingCard
            icon={<LuCloudOff />}
            title="Offline Power"
            description="Work anywhere, anytime. All features are available without an internet connection."
          />
          <MarketingCard
            icon={<LuFileText />}
            title="Markdown Focused"
            description="Real-time preview and system-native DOCX export support for a modern writing workflow."
          />
          <MarketingCard
            icon={<LuLayoutGrid />}
            title="Minimalist UI"
            description="A clean, distraction-free environment that lets you focus on what matters: your content."
          />
        </Grid>
      </Section>

      <CTASection />
    </Page>
  );
}
