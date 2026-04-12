import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LuMenu, LuX } from 'react-icons/lu';
import { Button } from '../Button';
import { BrandLogo } from '../ui/BrandLogo';
import { NavItem } from './Navbar/NavItem';
import { Flex, Container, Stack } from '../ui/Layout';
import { cn } from '../../lib/utils';

export function Navbar() {
  const location = useLocation();
  const isEditor = location.pathname === '/editor';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 border-b border-border/40 bg-editor-bg backdrop-blur-md">
      <Container className={cn("h-12", isEditor ? "max-w-none px-3" : "")}>
        <Flex justify="between" className="h-full">
          <Flex justify="start">
            <BrandLogo size="sm" />
          </Flex>

          <Flex justify="center" gap={8} className="hidden md:flex">
            <NavItem to="/download">Download</NavItem>
            <NavItem to="/contact">Contact</NavItem>
          </Flex>

          <Flex justify="end" gap={2}>
            {!isEditor ? (
              <>
                <Button to="/editor" variant="primary" size="sm" className="shadow-lg shadow-theme-primary/30">
                  Online Editor
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  iconOnly
                  className="md:hidden"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? <LuX size={20} /> : <LuMenu size={20} />}
                </Button>
              </>
            ) : (
              <div className="w-8" />
            )}
          </Flex>
        </Flex>
      </Container>

      {menuOpen && !isEditor && (
        <div className="md:hidden border-t border-border/40 bg-editor-bg">
          <Container>
            <Stack gap={1} className="py-3">
              <NavItem to="/download" className="py-2" onClick={() => setMenuOpen(false)}>Download</NavItem>
              <NavItem to="/contact" className="py-2" onClick={() => setMenuOpen(false)}>Contact</NavItem>
            </Stack>
          </Container>
        </div>
      )}
    </nav>
  );
}
