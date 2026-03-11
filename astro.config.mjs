// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://vladhorovyy.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
