import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        popup: resolve(__dirname, "popup.html"),
        content: resolve(__dirname, "content.html"),
        background: resolve(__dirname, "background.html"),
        backgroundScript: resolve(__dirname, "src/background/background.js"),
        offscreen: resolve(__dirname, "src/background/offscreen.js"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const nameMap = {
            'backgroundScript': 'assets/background.js',
            'offscreen': 'assets/offscreen.js'
          };
          return nameMap[chunkInfo.name] || 'assets/[name].js';
        },
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      }
    },
  },
});
