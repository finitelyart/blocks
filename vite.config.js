import { defineConfig } from 'vite';

export default defineConfig({
  // Dynamically set the base path for GitHub Pages
  base: process.env.VITE_BASE_URL || '/',
  plugins: [],
  build: {
    chunkSizeWarningLimit: 1600, // Phaser is large
  },
});