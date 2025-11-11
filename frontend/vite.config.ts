import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
    base: "", // OK
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: { "@": path.resolve(__dirname, "src") },
    },
    build: {
        outDir: "extension/dist",
        emptyOutDir: true,
        cssCodeSplit: false,
        rollupOptions: {
            input: { "react-panel": "src/panel/panelEntry.tsx" },
            output: {
                entryFileNames: "react-panel.js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: (info) =>
                    info.name?.endsWith(".css") ? "react-panel.css" : "assets/[name][extname]",
            },
        },
    },
    worker: { format: "es" },
});
