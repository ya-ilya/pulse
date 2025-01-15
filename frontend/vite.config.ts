import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true
  },
});
