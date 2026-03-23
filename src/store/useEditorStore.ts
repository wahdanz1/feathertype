import { create } from 'zustand';
import { Tab } from '../types';
import { v4 as uuidv4 } from 'uuid';
import type { EditorView } from '@codemirror/view';

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
}

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
  markTabClean: (tabId: string) => void;

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

  // Getters
  getActiveTab: () => Tab | null;
  getUnsavedTab: () => Tab | null;
}

const initialTabId = uuidv4();

export const useEditorStore = create<EditorStore>((set, get) => ({
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

    // Show dialog if tab has unsaved changes
    if (tab?.isDirty) {
      set({
        unsavedChangesDialog: {
          isOpen: true,
          tabId,
        },
      });
      return;
    }

    // Close tab immediately if no unsaved changes
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

  confirmCloseTab: () => {
    const state = get();
    const tabId = state.unsavedChangesDialog.tabId;

    if (!tabId) return;

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

    // Import here to avoid circular dependency
    const { handleSaveFile } = await import('../components/FileMenu');

    // Save the file
    await handleSaveFile(tab, get().markTabClean, get().updateTabPath);

    // Then close the tab
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
}));
