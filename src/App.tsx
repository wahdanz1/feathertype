import { useLayoutEffect, Suspense, lazy } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useLocation,
  Outlet
} from 'react-router-dom';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { cn } from './lib/utils';
import { isEditorRoute, syncDocumentTheme } from './lib/documentTheme';
import './App.css';

const Home = lazy(() => import('./pages/Home.tsx'));
const Download = lazy(() => import('./pages/Download.tsx'));
const Contact = lazy(() => import('./pages/Contact.tsx'));
const Privacy = lazy(() => import('./pages/Privacy.tsx'));
const AppShell = lazy(() => import('./components/AppShell').then((m) => ({ default: m.AppShell })));

function RootLayout() {
  const location = useLocation();
  const isEditor = isEditorRoute(location.pathname, false);

  // The editor syncs its own theme from the store; marketing pages are always dark.
  useLayoutEffect(() => {
    if (!isEditor) syncDocumentTheme(document, 'dark', false);
  }, [isEditor]);

  return (
    <div className={cn("flex flex-col min-h-screen", isEditor && "h-screen overflow-hidden")}>
      <ScrollToTop />
      <Navbar />

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
    children: [
      { index: true, element: <Home /> },
      { path: "editor", element: <AppShell /> },
      { path: "download", element: <Download /> },
      { path: "contact", element: <Contact /> },
      { path: "privacy", element: <Privacy /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
