import { defineConfig } from "vite";

export default defineConfig({
  // FitStyle 3D is deployed as a GitHub Pages project site at:
  // https://christianloydcesista.github.io/fitstyle-3d/
  // Using the explicit repository base ensures compiled JS/CSS and public
  // assets always resolve from the project path instead of the domain root.
  base: "/fitstyle-3d/",
});
