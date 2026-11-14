/// <reference types="vitest/config" />
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { defineConfig, transformWithEsbuild, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const THEME_SOURCE = fileURLToPath(new URL("./src/lib/documentTheme.ts", import.meta.url));
const THEME_SCRIPT = "theme-init.js";

// A classic external script, not inline: it must block first paint, and the Tauri CSP (script-src 'self') rejects inline code.
function prePaintTheme(): Plugin {
  let mode = "";
  const compile = async () => {
    const source = await readFile(THEME_SOURCE, "utf8");
    const { code } = await transformWithEsbuild(source, THEME_SOURCE, {
      format: "iife",
      globalName: "theme",
      target: "es2020",
      minify: true,
    });
    return `(function(){${code}theme.applyInitialDocumentTheme(${JSON.stringify(mode)},window)})();\n`;
  };

  return {
    name: "feathertype-pre-paint-theme",
    configResolved(config) {
      mode = config.mode;
    },
    configureServer(server) {
      server.middlewares.use(`/${THEME_SCRIPT}`, (_req, res, next) => {
        compile().then((code) => {
          res.setHeader("Content-Type", "text/javascript");
          res.end(code);
        }, next);
      });
    },
    async generateBundle() {
      this.emitFile({ type: "asset", fileName: THEME_SCRIPT, source: await compile() });
    },
    transformIndexHtml() {
      return [{ tag: "script", attrs: { src: `/${THEME_SCRIPT}` }, injectTo: "head" }];
    },
  };
}

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), tailwindcss(), prePaintTheme()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-docx': ['docx'],
          'vendor-codemirror': [
            '@codemirror/view',
            '@codemirror/state',
            '@codemirror/language',
            '@codemirror/commands',
            '@codemirror/search',
          ],
        },
      },
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
}));
