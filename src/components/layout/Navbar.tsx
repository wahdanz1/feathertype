import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LuMenu, LuX } from 'react-icons/lu';
import { Button } from '../Button';
import { BrandLogo } from '../ui/BrandLogo';
import { NavItem } from './Navbar/NavItem';
import { Flex, Stack } from '../ui/Layout';

export function Navbar() {
  const location = useLocation();
  const isEditor = location.pathname === '/editor';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 border-b border-border/40 bg-editor-bg backdrop-blur-md">
      <div className="h-12 px-4">
        <Flex justify="between" className="h-full">
          <Flex justify="start" className="flex-1">
            <BrandLogo size="sm" />
          </Flex>

          <Flex justify="center" gap={8} className="hidden md:flex">
            <NavItem to="/download">Download</NavItem>
            <NavItem to="/contact">Contact</NavItem>
          </Flex>

          <Flex justify="end" gap={2} className="flex-1">
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
            ) : null}
          </Flex>
        </Flex>
      </div>

      {menuOpen && !isEditor && (
        <div className="md:hidden border-t border-border/40 bg-editor-bg px-4">
          <Stack gap={1} className="py-3">
            <NavItem to="/download" className="py-2" onClick={() => setMenuOpen(false)}>Download</NavItem>
            <NavItem to="/contact" className="py-2" onClick={() => setMenuOpen(false)}>Contact</NavItem>
          </Stack>
        </div>
      )}
    </nav>
  );
}
