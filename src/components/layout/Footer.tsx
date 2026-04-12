import { Link } from 'react-router-dom';
import { Stack, Flex, Container } from '../ui/Layout';
import { BrandLogo } from '../ui/BrandLogo';
import { APP_NAME } from '../../config';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-editor-bg py-10 px-4 shadow-inner">
      <Container>
        <Flex gap={8} className="flex-col md:flex-row md:items-start md:justify-between">
          <Stack gap={3} className="items-center md:items-start">
            <BrandLogo />
            <p className="text-sm max-w-xs text-theme-text-muted leading-relaxed text-center md:text-left">
              A feather-light writing experience that stays out of your way.
            </p>
          </Stack>

          <Flex gap={6} className="flex-wrap justify-center md:justify-end text-sm">
            <FooterLink to="/editor">Online Editor</FooterLink>
            <FooterLink to="/download">Download</FooterLink>
            <FooterLink to="/download#releases">Release Log</FooterLink>
            <FooterLink to="/download#feedback">Feedback</FooterLink>
          </Flex>
        </Flex>

        <Flex justify="between" className="mt-8 pt-6 border-t border-border/20 text-xs text-theme-text-muted">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}.</p>
          <Link to="/privacy" className="hover:text-theme-accent transition-colors">
            Privacy Policy
          </Link>
        </Flex>
      </Container>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-theme-text-muted hover:text-theme-accent transition-colors">
      {children}
    </Link>
  );
}
