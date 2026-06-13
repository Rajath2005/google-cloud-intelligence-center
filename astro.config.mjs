// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://cloud.rajathkiran.me',

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // Explicitly pre-bundle all CJS packages that R3F depends on.
      // Without this, Vite tries to serve them as raw ESM and fails with
      // "does not provide an export named 'default'" errors.
      include: [
        'three',
        '@react-three/fiber',
        '@react-three/drei',
        '@react-three/postprocessing',
        'postprocessing',
        'd3-force-3d',
        'use-sync-external-store',
        'use-sync-external-store/shim',
        'use-sync-external-store/shim/with-selector',
      ],
    },
  },

  integrations: [
    react(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      customPages: [],
    }),
  ],

  adapter: cloudflare(),
});