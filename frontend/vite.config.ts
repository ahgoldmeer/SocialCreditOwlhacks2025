import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/leaderboard': 'http://localhost:5000',
      '/cleanups': 'http://localhost:5000',
      '/auth': 'http://localhost:5000',
      '/schools': 'http://localhost:5000',
      '/users': 'http://localhost:5000',
      '/genai': 'http://localhost:5000'
    }
  }
});
