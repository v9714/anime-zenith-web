
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      // Add compression and caching headers in development for testing
      'Cache-Control': 'max-age=31536000',
      'X-Content-Type-Options': 'nosniff'
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable minification and code splitting
    minify: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Chunk by category to optimize caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['@/lib/utils.ts', '@/services/api.ts'],
          ui: [
            '@/components/ui/button.tsx',
            '@/components/ui/card.tsx',
            '@/components/ui/skeleton.tsx',
          ],
        }
      }
    },
  },
}));
