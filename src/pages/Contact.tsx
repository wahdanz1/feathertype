import { SectionHeader } from '../components/SectionHeader';
import { Grid, Page, Section } from '../components/ui/Layout';
import { MarketingCard } from '../components/marketing/MarketingCard';
import { SiGithub, SiDiscord } from 'react-icons/si';
import { LuLinkedin } from 'react-icons/lu';

export default function Contact() {
  return (
    <Page>
      <Section size="lg" animate="slide-up" className="py-20">
        <SectionHeader
          level="h1"
          title="Let's connect."
          description="The best way to reach me is through social media. Whether you have questions, feedback, or just want to chat, feel free to reach out!"
          center
        />

        <Grid cols={3} gap={8} className="mt-16">
          <MarketingCard
            href="https://discord.com/users/wahdanz#5803"
            icon={<SiDiscord />}
            title="Discord"
            metadata="wahdanz#5803"
            description="Join the community or send me a direct message."
            variant="social"
            isExternal
          />
          <MarketingCard
            href="https://github.com/wahdanz1"
            icon={<SiGithub />}
            title="GitHub"
            metadata="wahdanz1"
            description="Check out my other projects and contributions."
            variant="social"
            isExternal
          />
          <MarketingCard
            href="https://www.linkedin.com/in/dwahlgren/"
            icon={<LuLinkedin />}
            title="LinkedIn"
            metadata="dwahlgren"
            description="For professional networking and business inquiries."
            variant="social"
            isExternal
          />

        </Grid>
      </Section>
    </Page>
  );
}
