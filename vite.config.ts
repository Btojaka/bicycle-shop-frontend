import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(
      "postgresql://postgres:dQBzoIofBVEtRSvFRFgaYqpmGsjIMmaL@autorack.proxy.rlwy.net:27709/railway"
    ),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
  base: "/bicycle-shop-frontend/",
});
