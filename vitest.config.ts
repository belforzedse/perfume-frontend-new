import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    css: {
      modules: {
        classNameStrategy: "non-scoped",
      },
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
});
