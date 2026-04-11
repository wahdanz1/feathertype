import { Link } from 'react-router-dom';
import { Stack, Flex, Grid, Container } from '../ui/Layout';
import { BrandLogo } from '../ui/BrandLogo';
import { Badge } from '../ui/Badge';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-editor-bg py-12 px-4 shadow-inner">
      <Container>
        <Grid cols={3} gap={8}>
          <Stack gap={4}>
            <BrandLogo size="lg" />
            <p className="text-sm max-w-xs text-theme-text-muted leading-relaxed">
              A feather-light writing experience that stays out of your way. Built with modern tools and a minimalist philosophy. 
            </p>
          </Stack>

          <FooterColumn title="Product">
            <FooterLink to="/editor">Online Editor</FooterLink>
            <FooterLink to="/download">Download</FooterLink>
            <FooterLink to="/download#releases">Release Log</FooterLink>
            <FooterLink to="/download#feedback">Feedback</FooterLink>
          </FooterColumn>

          <FooterColumn title="Legal">
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
            <FooterLink to="/terms">Terms of Service</FooterLink>
          </FooterColumn>
        </Grid>

        <Flex justify="between" className="mt-12 pt-8 border-t border-border/20 text-xs text-theme-text-muted">
          <p>© {new Date().getFullYear()} FeatherType.</p>
          <Badge label="v1.0.0 Stable" />
        </Flex>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack gap={4}>
      <h4 className="text-sm font-semibold uppercase tracking-wider text-theme-accent">{title}</h4>
      <ul className="flex flex-col gap-2">
        {children}
      </ul>
    </Stack>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-sm text-theme-text-muted hover:text-theme-accent transition-colors">
        {children}
      </Link>
    </li>
  );
}
