import { useEffect, Suspense, lazy } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useLocation,
  useBlocker,
  Outlet
} from 'react-router-dom';
import { useEditorStore } from './store/useEditorStore';
import { AppShell } from './components/AppShell';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { Navbar } from './components/layout/Navbar';
import { cn } from './lib/utils';
import { UnsavedChangesDialog } from './components/UnsavedChangesDialog';
import './App.css';

// Lazy load website components to keep Tauri app lean
const Home = lazy(() => import('./pages/Home.tsx'));
const Download = lazy(() => import('./pages/Download.tsx'));
const Contact = lazy(() => import('./pages/Contact.tsx'));

// Tauri detection
const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined;

function RootLayout() {
  const theme = useEditorStore((s) => s.theme);
  const tabs = useEditorStore((s) => s.tabs);
  const location = useLocation();

  const isDirty = tabs.some(t => t.isDirty);
  const dirtyTab = tabs.find(t => t.isDirty);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  const isEditor = location.pathname === '/editor' || isTauri;

  // Apply theme class and layout behavior to body and root
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

      <main className={cn("flex-1 min-h-0", isEditor ? "overflow-hidden" : "overflow-visible")}>
        <Suspense fallback={<div className="h-full w-full bg-editor-bg" />}>
          <Outlet />
        </Suspense>
      </main>

      {blocker.state === "blocked" && dirtyTab && (
        <UnsavedChangesDialog
          tab={dirtyTab}
          onContinueEditing={() => blocker.reset()}
          onDiscardChanges={() => blocker.proceed()}
          onSaveAndClose={async () => {
            blocker.proceed();
          }}
        />
      )}
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
        { path: "*", element: <Navigate to="/" replace /> },
      ]
  }
]);

function App() {
  // Tauri: render AppShell directly (no router overhead, matches original working layout)
  if (isTauri) {
    return <TauriApp />;
  }
  // Web: use router for landing page + editor
  return <RouterProvider router={router} />;
}

function TauriApp() {
  const theme = useEditorStore((s) => s.theme);

  // Apply theme class and layout behavior to body and root (Always editor mode in Tauri)
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
    <div className="h-screen overflow-hidden">
      <AppShell />
    </div>
  );
}

export default App;
