import { defineConfig } from "vite";

export default defineConfig({
  // Relative assets keep the production build usable on GitHub Pages
  // even when the repository is hosted under /<repository-name>/.
  base: "./",
});
