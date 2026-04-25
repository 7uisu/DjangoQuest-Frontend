import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()], // Enable React plugin
  server: {
    proxy: {
      // Proxy /api/users to backend
      '/api/users': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true, // Adjust host header
        secure: false, // Allow non-HTTPS in dev
      },
      // Proxy /api/tutorials to backend
      '/api/tutorials': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy /api/dashboard to backend
      '/api/dashboard': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy /api/game to backend
      '/api/game': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy /api/admin to backend
      '/api/admin': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy /api/feedback to backend
      '/api/feedback': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy /api/announcements to backend
      '/api/announcements': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});