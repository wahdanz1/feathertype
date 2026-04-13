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
            A lightweight Markdown editor for notes, docs, and everyday writing.
            Fast to open, simple to use, and everything stays on your device.
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
          description="No account, no cloud, no bloat. Just a clean editor that opens instantly and gets out of your way."
        />

        <Grid cols={3} gap={8} className="mt-16">
          <MarketingCard
            icon={<LuZap />}
            title="Opens Instantly"
            description="No splash screens, no loading bars. Click and start typing — it's ready before you are."
          />
          <MarketingCard
            icon={<LuShield />}
            title="Your Files, Your Device"
            description="Nothing is uploaded or synced. Your documents stay on your machine, always."
          />
          <MarketingCard
            icon={<LuCpu />}
            title="Native Speed"
            description="Built on Rust and Tauri, so it stays snappy even with large documents."
          />
          <MarketingCard
            icon={<LuCloudOff />}
            title="Works Offline"
            description="No internet needed. Everything works the same whether you're online or not."
          />
          <MarketingCard
            icon={<LuFileText />}
            title="Markdown + Live Preview"
            description="Write in Markdown with a side-by-side preview. Import Word documents, export when you need to."
          />
          <MarketingCard
            icon={<LuLayoutGrid />}
            title="Clean Interface"
            description="Multi-tab editing, dark and light themes, keyboard shortcuts — nothing extra, nothing missing."
          />
        </Grid>
      </Section>

      <CTASection />
    </Page>
  );
}
