
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
      // Remove content encoding headers in development to avoid decoding issues
      'Cache-Control': 'max-age=31536000',
      'X-Content-Type-Options': 'nosniff',
      // Remove 'Content-Encoding' header which was causing the ERR_CONTENT_DECODING_FAILED error
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
    // Configure different minification options based on mode
    minify: mode === 'production' ? "terser" : false,
    cssCodeSplit: true,
    // Only use terser options in production
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    } : undefined,
    // Optimize asset loading
    assetsInlineLimit: 4096, // 4KB - inline small assets
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
        },
        // Add content hash to file names for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
  },
  // Optimize asset compression - disable built-in compression to avoid encoding issues
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  }
}));
