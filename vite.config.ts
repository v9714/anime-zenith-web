import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  server: {
    host: "::",
    port: 8080,
    hmr: {
      clientPort: 8080,
      port: 8080,
    },
    headers: {
      'Cache-Control': 'max-age=31536000',
      'X-Content-Type-Options': 'nosniff',
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
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
    },
    dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom', '@tanstack/react-query'],
  },
  build: {
    minify: mode === 'production' ? "esbuild" : false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    target: 'esnext',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react/jsx-runtime',
      '@tanstack/react-query',
      'lucide-react',
      'clsx',
      'tailwind-merge'
    ],
    force: true,
  },
  define: {
    global: 'globalThis',
  },
}));