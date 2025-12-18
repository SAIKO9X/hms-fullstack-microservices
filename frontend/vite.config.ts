import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    watch: {
      usePolling: true,
    },
  },
  define: {
    // Algumas bibliotecas (como sockjs-client) usam 'global' que é do Node.js
    // Por isso mapear para 'window' para funcionar no navegador
    global: "window",
  },
});
