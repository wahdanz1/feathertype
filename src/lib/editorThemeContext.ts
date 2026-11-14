import { createContext } from 'react';
import type { Theme } from './documentTheme';

// Null outside the editor, so marketing components get the always-dark site styling without loading the editor store.
export const EditorThemeContext = createContext<Theme | null>(null);
