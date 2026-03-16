import { create } from 'zustand';
import { Tab } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface EditorState {
  tabs: Tab[];
  activeTabId: string | null;
  showPreview: boolean;
  theme: 'dark' | 'light';
}

interface EditorStore extends EditorState {
  // Tab management
  addTab: (tab?: Partial<Tab>) => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  updateTabPath: (tabId: string, path: string, title: string) => void;
  markTabClean: (tabId: string) => void;

  // UI state
  togglePreview: () => void;
  setShowPreview: (show: boolean) => void;
  toggleTheme: () => void;

  // Getters
  getActiveTab: () => Tab | null;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  showPreview: true,
  theme: 'dark',

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

    // Warn if tab has unsaved changes
    if (tab?.isDirty) {
      const confirmed = confirm(`${tab.title} has unsaved changes. Close anyway?`);
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

  getActiveTab: () => {
    const state = get();
    return state.tabs.find((t) => t.id === state.activeTabId) || null;
  },
}));
