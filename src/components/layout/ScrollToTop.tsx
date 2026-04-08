import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If we have a hash, find the element and scroll to it
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      // If no hash, scroll to top of page
      window.scrollTo({
        top: 0,
        behavior: 'instant' as ScrollBehavior // Use instant for page transitions to avoid sliding from previous page
      });
    }
  }, [pathname, hash]);

  return null;
}
