import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages project URL: https://amazonhyperiq.github.io/family-store/
  base: "/family-store/",
});
