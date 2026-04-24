import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Enable manual chunks for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animations: ['framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
    // Drop console.log in production
    minify: 'esbuild',
    // Remove console.* and debugger statements in production
    esbuild: {
      drop: ['console', 'debugger'],
      // Move legal comments (licenses, @preserve) to a separate .LEGAL.txt file
      // instead of embedding them in every JS chunk. Removes version info from
      // production bundles while keeping license attribution accessible.
      legalComments: 'external',
    },
  },
});
