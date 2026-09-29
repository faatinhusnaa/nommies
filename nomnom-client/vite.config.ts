// nomnom-client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- Restores Tailwind v4 styles
  ],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['fifty-doorpost-giddily.ngrok-free.dev',
      '.ngrok-free.dev',
    ],
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/posts': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/portfolio': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});