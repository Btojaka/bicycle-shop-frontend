import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  base: "/bicycle-shop-frontend/",
  plugins: [react()],
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(
      "https://bicycle-shop-backend-jqz7.onrender.com"
    ),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
