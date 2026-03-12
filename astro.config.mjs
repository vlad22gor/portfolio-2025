// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://vladhorovyy.com',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'load',
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
