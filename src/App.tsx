import { useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useEditorStore } from './store/useEditorStore';
import './App.css';

function App() {
  useKeyboardShortcuts();
  const theme = useEditorStore((s) => s.theme);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : '';
  }, [theme]);

  return <AppShell />;
}

export default App;
