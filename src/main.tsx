import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { detectTauri } from "./lib/documentTheme";

const isTauri = detectTauri(import.meta.env.MODE, window);
console.log(`[FeatherType] Environment: ${isTauri ? 'Tauri' : 'Web'} (Mode: ${import.meta.env.MODE})`);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
const render = (Root: React.ComponentType) =>
  root.render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>,
  );

// The web entry stays free of the editor; the desktop app loads it before its first render, so no fallback flashes.
if (isTauri) void import("./TauriApp").then((m) => render(m.default));
else render(App);
