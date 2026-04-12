import { useEffect, Suspense, lazy } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  MemoryRouter,
  Navigate,
  useLocation,
  Outlet
} from 'react-router-dom';
import { useEditorStore } from './store/useEditorStore';
import { AppShell } from './components/AppShell';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { cn } from './lib/utils';
import './App.css';

const Home = lazy(() => import('./pages/Home.tsx'));
const Download = lazy(() => import('./pages/Download.tsx'));
const Contact = lazy(() => import('./pages/Contact.tsx'));
const Privacy = lazy(() => import('./pages/Privacy.tsx'));

const isTauri = import.meta.env.MODE === 'tauri' || (import.meta.env.MODE === 'development' && typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined);

console.log(`[FeatherType] Environment: ${isTauri ? 'Tauri' : 'Web'} (Mode: ${import.meta.env.MODE})`);

function RootLayout() {
  const theme = useEditorStore((s) => s.theme);
  const location = useLocation();

  const isEditor = location.pathname === '/editor' || isTauri;

  useEffect(() => {
    const bodyClasses = [];
    if (theme === 'light') bodyClasses.push('light-theme');
    if (isEditor) bodyClasses.push('is-editor-body');
    document.body.className = bodyClasses.join(' ');

    const rootElement = document.getElementById('root');
    if (rootElement) {
      if (isEditor) {
        rootElement.classList.add('is-editor-root');
      } else {
        rootElement.classList.remove('is-editor-root');
      }
    }
  }, [theme, isEditor]);

  return (
    <div className={cn("flex flex-col min-h-screen", isEditor && "h-screen overflow-hidden")}>
      {!isTauri && <ScrollToTop />}
      {!isTauri && <Navbar />}

      <main className={cn("flex-1 flex flex-col min-h-0", isEditor ? "overflow-hidden" : "overflow-visible")}>
        <Suspense fallback={<div className="h-full w-full bg-editor-bg" />}>
          <Outlet />
        </Suspense>
      </main>

      {!isEditor && <Footer />}
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: isTauri
      ? [
        { index: true, element: <AppShell /> },
        { path: "*", element: <Navigate to="/" replace /> }
      ]
      : [
        { index: true, element: <Home /> },
        { path: "editor", element: <AppShell /> },
        { path: "download", element: <Download /> },
        { path: "contact", element: <Contact /> },
        { path: "privacy", element: <Privacy /> },
        { path: "*", element: <Navigate to="/" replace /> },
      ]
  }
]);

function App() {
  if (isTauri) return <TauriApp />;
  return <RouterProvider router={router} />;
}

function TauriApp() {
  const theme = useEditorStore((s) => s.theme);

  useEffect(() => {
    const bodyClasses = ['is-editor-body'];
    if (theme === 'light') bodyClasses.push('light-theme');
    document.body.className = bodyClasses.join(' ');

    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.add('is-editor-root');
    }
  }, [theme]);

  return (
    <MemoryRouter>
      <div className="h-screen overflow-hidden">
        <AppShell />
      </div>
    </MemoryRouter>
  );
}

export default App;
