import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  build: {
    rollupOptions: {
      // Handle potential issues with native dependencies
      external: [],
    },
    // Optimize for Vercel deployment
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
  },
  // Ensure compatibility across platforms
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
