import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    base: "",
    plugins: [react(), tailwindcss()],
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
    worker: {
        format: "es", // ★ 워커 ES 모듈
    },
});
