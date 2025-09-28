import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/leaderboard': 'http://flask-backend:5000',
      '/cleanups': 'http://flask-backend:5000',
      '/auth': 'http://flask-backend:5000',
      '/schools': 'http://flask-backend:5000',
      '/users': 'http://flask-backend:5000',
      '/genai': 'http://flask-backend:5000'
    }
  }
});
