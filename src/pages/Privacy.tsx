import { Page, Section, Stack } from '../components/ui/Layout';
import { APP_NAME } from '../config';

export default function Privacy() {
  return (
    <Page>
      <Section size="lg" animate="slide-up">
        <Stack gap={8} className="max-w-2xl">
          <h1>Privacy Policy</h1>

          <Stack gap={6} className="text-theme-text-muted leading-relaxed">
            <p>
              {APP_NAME} is a local-first markdown editor. Your documents live on your device
              and are never uploaded to any server. We have no database, no user accounts,
              and no tracking.
            </p>

            <Stack gap={2}>
              <h3 className="text-theme-text">What we don't collect</h3>
              <p>
                No personal information. No usage analytics. No cookies. No telemetry.
                The desktop app runs entirely offline — it never phones home.
              </p>
            </Stack>

            <Stack gap={2}>
              <h3 className="text-theme-text">Online editor</h3>
              <p>
                The browser-based editor at feathertype.vercel.app works the same way.
                Your documents stay in the browser and are never sent to a server.
                The site is a static frontend with no backend.
              </p>
            </Stack>

            <Stack gap={2}>
              <h3 className="text-theme-text">GitHub API</h3>
              <p>
                The download page fetches public release data from the GitHub API to show
                the latest version. This is a direct request from your browser to GitHub —
                {APP_NAME} does not proxy or log these requests.
              </p>
            </Stack>

            <Stack gap={2}>
              <h3 className="text-theme-text">Third-party hosting</h3>
              <p>
                The website is hosted on Vercel. Vercel may collect standard web server logs
                (IP address, browser type, timestamps) as part of their infrastructure.
                See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline">Vercel's privacy policy</a> for
                details.
              </p>
            </Stack>

            <Stack gap={2}>
              <h3 className="text-theme-text">Changes</h3>
              <p>
                If this policy changes, we'll update it here. Since there's nothing to collect,
                we don't expect it to.
              </p>
            </Stack>
          </Stack>
        </Stack>
      </Section>
    </Page>
  );
}
