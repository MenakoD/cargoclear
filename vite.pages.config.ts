import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("./pages", import.meta.url));
export default defineConfig({
  root,
  base: "/cargoclear/",
  publicDir: "../public",
  plugins: [react()],
  css: { postcss: { plugins: [] } },
  build: { outDir: "../docs", emptyOutDir: true },
});
