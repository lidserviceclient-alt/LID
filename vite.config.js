import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5174,
      proxy: {
        "/api": {
          target: env.VITE_BACKOFFICE_API_URL || "https://api.lidshopping.com/lid",
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist",
      target: "es2020",
      minify: "esbuild",
      cssMinify: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "ui-vendor": ["lucide-react"],
            "firebase-vendor": ["firebase/app", "firebase/auth", "firebase/firestore", "firebase/storage", "firebase/analytics"],
          },
        },
      },
      chunkSizeWarningLimit: 800,
    },
  };
});
