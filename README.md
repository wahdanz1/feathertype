# FeatherType

A feather-light Markdown editor that runs as a native desktop app (Tauri) and an online editor.

**[Try it in your browser](https://feathertype.vercel.app/editor)** | **[Download for desktop](https://feathertype.vercel.app/download)**

## Features

- Live split-pane Markdown preview
- Multi-tab editing with unsaved changes tracking
- DOCX import and export (open Word files as Markdown, export Markdown as Word)
- Dark and light themes
- Rich formatting toolbar and keyboard shortcuts
- Zoom control (Ctrl+scroll, Ctrl+/-, Ctrl+0 to reset)
- Character count and cursor position in status bar
- Offline-first — your documents never leave your device

## Tech Stack

- **Frontend:** React 19, TypeScript, CodeMirror 6, Zustand, Tailwind CSS v4
- **Desktop:** Tauri v2 (Rust)
- **Web:** Vite, hosted on Vercel

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 20.19+ or 22.12+ (Vite 7; CI uses 22)
- [pnpm](https://pnpm.io/)
- [Rust](https://rustup.rs/) (desktop app only)

### Run locally

```bash
pnpm install
pnpm dev        # website and web editor at http://localhost:1420
pnpm tauri dev  # desktop app
```

### Build

```bash
pnpm tauri build
```

### Release

Write release notes in `RELEASE_NOTES.md`, then:

```bash
pnpm release <version>
```

This bumps the version everywhere, tags, pushes, and triggers a GitHub Actions build for Windows, macOS, and Linux.

## License

[PolyForm Noncommercial 1.0.0](LICENSE) — free for personal and non-commercial use. Commercial use requires permission from the author. See the full license for details.
