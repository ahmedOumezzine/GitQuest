import { defineConfig } from 'vite';

export default defineConfig({
  // Keep the root URL convenient for local development while using the
  // repository sub-path in GitHub Actions / GitHub Pages builds.
  base: process.env.GITQUEST_PAGES === 'true' || process.env.GITHUB_ACTIONS === 'true' ? '/GitQuest/' : '/',
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } },
  },
  server: { host: 'localhost', port: 5173 },
});
