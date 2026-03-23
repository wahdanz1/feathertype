# FeatherType

A lightweight local Markdown editor built with Tauri and React.

## Features

- **Multi-tab editing** with unsaved change tracking
- **Live markdown preview** with GitHub Flavored Markdown support
- **Split-pane layout** (editor | preview) with toggle
- **Dark/light theme** support
- **Native file operations** via Tauri (New, Open, Save, Save As)
- **Rich formatting toolbar** (bold, italic, headings, lists, links, code)
- **Zoom / font-size control** with keyboard and Ctrl+scroll
- **Word count** and cursor position in the status bar
- **DOCX import** — open a Word document and it converts to Markdown automatically
- **Full keyboard shortcut** support

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- CodeMirror 6 (editor with syntax highlighting)
- react-markdown + remark-gfm (preview)
- Zustand (state management)
- Tailwind CSS v4

**Backend:**
- Tauri v2
- Rust
- Native fs and dialog plugins

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- [Rust](https://rustup.rs/)

### Install & Run

```bash
# Install dependencies
pnpm install

# Run development server
pnpm tauri dev

# Build for production (creates installer in src-tauri/target/release/bundle/)
pnpm tauri build
```

## Keyboard Shortcuts

### File Operations

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New tab |
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save |
| `Ctrl+Shift+S` | Save As |

### Editor

| Shortcut | Action |
|----------|--------|
| `Ctrl+F` | Find in file |
| `Ctrl+H` | Find & replace |
| `Alt+Z` | Toggle word wrap |
| `Ctrl+\` | Toggle preview pane |

### Formatting

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+K` | Insert link |
| `` Ctrl+` `` | Inline code |
| `Ctrl+1` | Heading 1 |
| `Ctrl+2` | Heading 2 |
| `Ctrl+3` | Heading 3 |

### Zoom

| Shortcut | Action |
|----------|--------|
| `Ctrl++` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+0` | Reset zoom |
| `Ctrl+Scroll` | Zoom in/out |

## Supported File Types

| Extension | Open | Save |
|-----------|------|------|
| `.md`, `.markdown` | Yes | Yes |
| `.txt` | Yes | Yes |
| `.docx` | Yes (converts to Markdown) | — |
