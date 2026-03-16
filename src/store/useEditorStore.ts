import { create } from 'zustand';
import { Tab } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ask } from '@tauri-apps/plugin-dialog';

interface EditorState {
  tabs: Tab[];
  activeTabId: string | null;
  showPreview: boolean;
  theme: 'dark' | 'light';
  lineWrap: boolean;
}

interface EditorStore extends EditorState {
  // Tab management
  addTab: (tab?: Partial<Tab>) => string;
  closeTab: (tabId: string) => Promise<void>;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  updateTabPath: (tabId: string, path: string, title: string) => void;
  markTabClean: (tabId: string) => void;

  // UI state
  togglePreview: () => void;
  setShowPreview: (show: boolean) => void;
  toggleTheme: () => void;
  toggleLineWrap: () => void;

  // Getters
  getActiveTab: () => Tab | null;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  showPreview: true,
  theme: 'dark',
  lineWrap: true,

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

  closeTab: async (tabId: string) => {
    const state = get();
    const tab = state.tabs.find((t) => t.id === tabId);

    // Warn if tab has unsaved changes
    if (tab?.isDirty) {
      const confirmed = await ask(`${tab.title} has unsaved changes. Close anyway?`, {
        title: 'Unsaved Changes',
        kind: 'warning',
      });
      if (!confirmed) return;
    }

    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== tabId);
      let newActiveId = state.activeTabId;

      // If closing active tab, switch to another
      if (state.activeTabId === tabId) {
        newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
      }

      return {
        tabs: newTabs,
        activeTabId: newActiveId,
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
          ? { ...tab, filePath: path, title }
          : tab
      ),
    }));
  },

  markTabClean: (tabId: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? { ...tab, isDirty: false }
          : tab
      ),
    }));
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

  getActiveTab: () => {
    const state = get();
    return state.tabs.find((t) => t.id === state.activeTabId) || null;
  },
}));
