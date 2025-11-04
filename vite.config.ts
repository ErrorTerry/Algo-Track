import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), tailwindcss(),],
    build: {
        outDir: "extension/dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                "react-panel": "src/panel/panelEntry.tsx"
            },
            output: {
                // 패널 엔트리 파일명을 고정 (content.js에서 고정 경로로 불러옴)
                entryFileNames: "react-panel.js",
                // css도 고정 파일명으로
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith(".css")) {
                        return "react-panel.css";
                    }
                    return "assets/[name][extname]";
                },
                chunkFileNames: "assets/[name]-[hash].js"
            }
        }
    }
});
