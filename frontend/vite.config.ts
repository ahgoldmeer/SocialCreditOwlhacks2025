import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/leaderboard': 'http://localhost:8000',
      '/cleanups': 'http://localhost:8000',
      '/auth': 'http://localhost:8000',
      '/schools': 'http://localhost:8000',
      '/users': 'http://localhost:8000'
    }
  }
});
