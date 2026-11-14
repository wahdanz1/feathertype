import { MemoryRouter } from 'react-router-dom';
import { useEditorStore } from './store/useEditorStore';
import { AppShell } from './components/AppShell';

// Once per launch, outside React: StrictMode would run an effect twice and repeat the notices.
void useEditorStore.getState().syncTabsWithDisk();

export default function TauriApp() {
  return (
    <MemoryRouter>
      <div className="h-screen overflow-hidden">
        <AppShell />
      </div>
    </MemoryRouter>
  );
}
