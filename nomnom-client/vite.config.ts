import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // <--- 1. Import this

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- 2. Add this here
  ],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['fifty-doorpost-giddily.ngrok-free.dev',
      '.ngrok-free.dev',
    ], // Allows ngrok
    proxy: {
      '/posts': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});