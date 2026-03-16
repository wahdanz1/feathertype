import { useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useEditorStore } from './store/useEditorStore';
import './App.css';

function App() {
  useKeyboardShortcuts();
  const addTab = useEditorStore((s) => s.addTab);
  const theme = useEditorStore((s) => s.theme);

  // Initialize with one empty tab on mount
  useEffect(() => {
    addTab();
  }, [addTab]);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : '';
  }, [theme]);

  return <AppShell />;
}

export default App;
