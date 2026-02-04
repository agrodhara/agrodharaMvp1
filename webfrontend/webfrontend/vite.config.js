import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_URL || "/",
  plugins: [react()],
  define: {
    // Expose base URL to the app for router basename
    "import.meta.env.BASE_URL": JSON.stringify(
      process.env.VITE_BASE_URL || "/",
    ),
  },
});
