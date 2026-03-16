# FeatherType

A lightweight local Markdown editor built with Tauri and React.

## Features

- **Multi-tab editing** with unsaved change tracking
- **Live markdown preview** with GitHub Flavored Markdown support
- **Split-pane layout** (editor | preview) with toggle
- **Dark/light theme** support
- **Native file operations** via Tauri (New, Open, Save, Save As)
- **Keyboard shortcuts** for fast workflow

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

# Build for production
pnpm tauri build
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New tab |
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save |
| `Ctrl+Shift+S` | Save As |
| `Ctrl+\` | Toggle preview |
| `Ctrl+F` | Search |
| `Ctrl+H` | Replace |
