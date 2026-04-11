import { Button } from '../Button';
import { GlassCard } from '../GlassCard';
import { Section, Stack, Flex } from '../ui/Layout';
import { LuArrowRight } from 'react-icons/lu';

export function CTASection() {
  return (
    <Section size="xl" className="mb-16">
      <GlassCard
        variant="gradient"
        padding="2xl"
        rounded="3xl"
        overflow="hidden"
        hoverable={false}
        className="text-center"
      >
        <Stack align="center" gap={8}>
          <h2>Ready to write?</h2>
          <p className="lead max-w-2xl">
            Experience the lightness of FeatherType today. Available as a desktop application for offline power,
            or right here in your browser.
          </p>
          <Flex gap={4} wrap justify="center">
            <Button to="/download" variant="primary" size="lg" className="px-12" animateIcon>
              Download Now
            </Button>
            <Button to="/editor" variant="secondary" size="lg" animateIcon>
              Online Editor
              <LuArrowRight className="ml-2" size={18} />
            </Button>
          </Flex>
        </Stack>
      </GlassCard>
    </Section>
  );
}
