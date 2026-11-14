import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tab } from '../types';
import { v4 as uuidv4 } from 'uuid';
import type { EditorView } from '@codemirror/view';
import {
  BROWSER_SAVE,
  canReloadFromDisk,
  getFileName,
  handleSaveFile,
  hashContent,
  isDocxPath,
  isTauri,
  readFile,
  toMarkdownPath,
} from '../utils/fileOperations';
import { createSafeStorage } from './persistStorage';

interface EditorState {
  tabs: Tab[];
  activeTabId: string | null;
  showPreview: boolean;
  theme: 'dark' | 'light';
  lineWrap: boolean;
  editorView: EditorView | null;
  zoom: number;
  unsavedChangesDialog: {
    isOpen: boolean;
    tabId: string | null;
  };
  showAboutDialog: boolean;
  notices: string[];
}

type PersistedState = Pick<EditorState, 'tabs' | 'activeTabId' | 'theme' | 'showPreview' | 'lineWrap' | 'zoom'>;

interface EditorStore extends EditorState {
  // Tab management
  addTab: (tab?: Partial<Tab>) => string;
  closeTab: (tabId: string) => void;
  confirmCloseTab: () => void;
  cancelCloseTab: () => void;
  saveAndCloseTab: () => Promise<void>;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  updateTabPath: (tabId: string, path: string, title: string) => void;
  renameTab: (tabId: string, title: string) => void;
  markTabClean: (tabId: string, savedContent: string) => void;
  syncTabsWithDisk: () => Promise<void>;

  // UI state
  togglePreview: () => void;
  setShowPreview: (show: boolean) => void;
  toggleTheme: () => void;
  toggleLineWrap: () => void;
  setEditorView: (view: EditorView | null) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setShowAboutDialog: (show: boolean) => void;
  addNotice: (message: string) => void;
  dismissNotice: () => void;

  // Getters
  getActiveTab: () => Tab | null;
  getUnsavedTab: () => Tab | null;
}

const initialTabId = uuidv4();

export const STORAGE_FULL_NOTICE =
  "This session is too large to keep in full, so some tabs won't come back after a restart. Save your work to keep it.";

const listNames = (tabs: Tab[]) => tabs.map((t) => `"${t.title}"`).join(', ');

const storage = createSafeStorage<PersistedState>(() => useEditorStore.getState().addNotice(STORAGE_FULL_NOTICE));

export const flushPersistedState = () => storage.flush();

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      tabs: [{
        id: initialTabId,
        title: 'Untitled',
        filePath: null,
        content: '',
        isDirty: false,
      }],
      activeTabId: initialTabId,
      showPreview: true,
      theme: 'dark',
      lineWrap: true,
      editorView: null,
      zoom: 100,
      unsavedChangesDialog: {
        isOpen: false,
        tabId: null,
      },
      showAboutDialog: false,
      notices: [],

      addTab: (partialTab = {}) => {
        const newId = uuidv4();
        const newTab: Tab = {
          id: newId,
          title: 'Untitled',
          filePath: null,
          content: '',
          isDirty: false,
          ...partialTab,
        };

        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newId,
        }));

        return newId;
      },

      closeTab: (tabId: string) => {
        const state = get();
        const tab = state.tabs.find((t) => t.id === tabId);

        if (tab?.isDirty) {
          set({
            unsavedChangesDialog: {
              isOpen: true,
              tabId,
            },
          });
          return;
        }

        set((state) => {
          const newTabs = state.tabs.filter((t) => t.id !== tabId);
          let newActiveId = state.activeTabId;

          if (state.activeTabId === tabId) {
            newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
          }

          return {
            tabs: newTabs,
            activeTabId: newActiveId,
          };
        });
      },

      confirmCloseTab: () => {
        const state = get();
        const tabId = state.unsavedChangesDialog.tabId;

        if (!tabId) return;

        set((state) => {
          const newTabs = state.tabs.filter((t) => t.id !== tabId);
          let newActiveId = state.activeTabId;

          if (state.activeTabId === tabId) {
            newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
          }

          return {
            tabs: newTabs,
            activeTabId: newActiveId,
            unsavedChangesDialog: {
              isOpen: false,
              tabId: null,
            },
          };
        });
      },

      cancelCloseTab: () => {
        set({
          unsavedChangesDialog: {
            isOpen: false,
            tabId: null,
          },
        });
      },

      saveAndCloseTab: async () => {
        const state = get();
        const tabId = state.unsavedChangesDialog.tabId;

        if (!tabId) return;

        const tab = state.tabs.find((t) => t.id === tabId);
        if (!tab) return;

        const saved = await handleSaveFile(tab, get().markTabClean, get().updateTabPath);
        const current = get().tabs.find((t) => t.id === tabId);
        if (!saved || !current || current.isDirty) return;

        set((state) => {
          const newTabs = state.tabs.filter((t) => t.id !== tabId);
          let newActiveId = state.activeTabId;

          if (state.activeTabId === tabId) {
            newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
          }

          return {
            tabs: newTabs,
            activeTabId: newActiveId,
            unsavedChangesDialog: {
              isOpen: false,
              tabId: null,
            },
          };
        });
      },

      setActiveTab: (tabId: string) => {
        set({ activeTabId: tabId });
      },

      updateTabContent: (tabId: string, content: string) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId
              ? { ...tab, content, isDirty: true }
              : tab
          ),
        }));
      },

      updateTabPath: (tabId: string, path: string, title: string) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId
              ? { ...tab, filePath: path, title, suggestedPath: undefined }
              : tab
          ),
        }));
      },

      renameTab: (tabId: string, title: string) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, title } : tab
          ),
        }));
      },

      markTabClean: (tabId: string, savedContent: string) => {
        set((state) => ({
          tabs: state.tabs.map((tab) => {
            if (tab.id !== tabId) return tab;
            const diskHash = canReloadFromDisk(tab) ? hashContent(savedContent) : tab.diskHash;
            return { ...tab, diskHash, isDirty: tab.content === savedContent ? false : tab.isDirty };
          }),
        }));
      },

      syncTabsWithDisk: async () => {
        if (!isTauri()) return;
        const changed: Tab[] = [];
        const unreadable: Tab[] = [];
        const lost: Tab[] = [];

        await Promise.all(get().tabs.filter(canReloadFromDisk).map(async (before) => {
          const disk = await readFile(before.filePath!).catch(() => null);
          const tab = get().tabs.find((t) => t.id === before.id);
          // Leave tabs alone that were edited or saved while the read was in flight.
          if (tab !== before) return;

          let patch: Partial<Tab> | null = null;
          if (disk === null) {
            if (tab.unloaded) {
              // Nothing to keep and nothing to show: saving an empty buffer here would wipe the file.
              patch = { filePath: null, suggestedPath: tab.filePath!, unloaded: undefined };
              lost.push(tab);
            } else {
              patch = { isDirty: true };
              unreadable.push(tab);
            }
          } else if (!tab.isDirty) {
            if (tab.unloaded || disk !== tab.content || !tab.diskHash) {
              patch = { content: disk, diskHash: hashContent(disk), unloaded: undefined };
            }
          } else if (tab.diskHash) {
            if (hashContent(disk) !== tab.diskHash) changed.push(tab);
          } else if (disk === tab.content) {
            patch = { isDirty: false, diskHash: hashContent(disk) };
          }

          if (patch) {
            const update = patch;
            set((state) => ({ tabs: state.tabs.map((t) => (t.id === tab.id ? { ...t, ...update } : t)) }));
          }
        }));

        const { addNotice } = get();
        if (changed.length) {
          addNotice(`${listNames(changed)} changed on disk since your last save. Your unsaved edits are kept: save to overwrite the file, or close the tab without saving and reopen the file to load the disk version.`);
        }
        if (unreadable.length) {
          addNotice(`Couldn't read ${listNames(unreadable)} from disk. Your copy is kept as unsaved; save to write it back.`);
        }
        if (lost.length) {
          addNotice(`Couldn't read ${listNames(lost)} from disk. Reopen the file once it's available.`);
        }
      },

      togglePreview: () => {
        set((state) => ({ showPreview: !state.showPreview }));
      },

      setShowPreview: (show: boolean) => {
        set({ showPreview: show });
      },

      toggleTheme: () => {
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }));
      },

      toggleLineWrap: () => {
        set((state) => ({ lineWrap: !state.lineWrap }));
      },

      setEditorView: (view) => {
        set({ editorView: view });
      },

      setZoom: (zoom: number) => {
        // Clamp zoom between 50% and 200%
        const clampedZoom = Math.max(50, Math.min(200, zoom));
        set({ zoom: clampedZoom });
      },

      zoomIn: () => {
        const state = get();
        const newZoom = Math.min(200, state.zoom + 10);
        set({ zoom: newZoom });
      },

      zoomOut: () => {
        const state = get();
        const newZoom = Math.max(50, state.zoom - 10);
        set({ zoom: newZoom });
      },

      resetZoom: () => {
        set({ zoom: 100 });
      },
      setShowAboutDialog: (show: boolean) => {
        set({ showAboutDialog: show });
      },

      addNotice: (message: string) => {
        set((state) => ({ notices: [...state.notices, message] }));
      },

      dismissNotice: () => {
        set((state) => ({ notices: state.notices.slice(1) }));
      },

      getActiveTab: () => {
        const state = get();
        return state.tabs.find((t) => t.id === state.activeTabId) || null;
      },

      getUnsavedTab: () => {
        const state = get();
        const tabId = state.unsavedChangesDialog.tabId;
        if (!tabId) return null;
        return state.tabs.find((t) => t.id === tabId) || null;
      },
    }),
    {
      name: 'feathertype-storage',
      version: 2,
      storage,
      migrate: (persisted, version) => {
        const state = persisted as Partial<EditorState>;
        // v0 could hold a web File, which JSON turns into {}.
        if (version < 1 && Array.isArray(state.tabs)) {
          state.tabs = state.tabs.map((tab) =>
            tab.filePath === null || typeof tab.filePath === 'string'
              ? tab
              : { ...tab, filePath: BROWSER_SAVE }
          );
        }
        // v1 tabs imported from Word still target the .docx, so Ctrl+S would overwrite it.
        if (version < 2 && Array.isArray(state.tabs)) {
          state.tabs = state.tabs.map((tab) => {
            const target = tab.filePath === BROWSER_SAVE ? tab.title : tab.filePath;
            if (!target || !isDocxPath(target)) return tab;
            const suggestedPath = toMarkdownPath(target);
            return { ...tab, filePath: null, title: getFileName(suggestedPath), suggestedPath };
          });
        }
        return state as EditorStore;
      },
      // Only persist specific keys to avoid bloat or singleton view refs
      partialize: (state): PersistedState => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        theme: state.theme,
        showPreview: state.showPreview,
        lineWrap: state.lineWrap,
        zoom: state.zoom,
      }),
    }
  )
);
