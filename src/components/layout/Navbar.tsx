import { useLocation } from 'react-router-dom';
import { Button } from '../Button';
import { BrandLogo } from '../ui/BrandLogo';
import { NavItem } from './Navbar/NavItem';
import { Flex, Container } from '../ui/Layout';
import { cn } from '../../lib/utils';

export function Navbar() {
  const location = useLocation();
  const isEditor = location.pathname === '/editor';

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 border-b border-border/40 bg-editor-bg backdrop-blur-md h-12">
      <Container className={cn("h-full", isEditor ? "max-w-none px-3" : "")}>
        <Flex justify="between" className="h-full grid grid-cols-3">
          <Flex justify="start">
            <BrandLogo size="sm" />
          </Flex>

          <Flex justify="center" gap={8} className="hidden md:flex">
            <NavItem to="/download">Download</NavItem>
            <NavItem to="/contact">Contact</NavItem>
          </Flex>

          <Flex justify="end">
            {!isEditor ? (
              <Button to="/editor" variant="primary" size="sm" className="shadow-lg shadow-theme-primary/30">
                Online Editor
              </Button>
            ) : (
              <div className="w-8" />
            )}
          </Flex>
        </Flex>
      </Container>
    </nav>
  );
}
