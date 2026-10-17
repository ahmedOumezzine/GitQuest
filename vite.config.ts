import { defineConfig } from 'vite';

export default defineConfig({
  build: { chunkSizeWarningLimit: 1200 },
  server: { host: 'localhost', port: 5173 },
});
