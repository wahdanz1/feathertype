import { detectTauri } from './documentTheme';

export const isTauri = (): boolean => detectTauri(import.meta.env.MODE, window);
