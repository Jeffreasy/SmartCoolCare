import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
    integrations: [react({
        // Enable React for interactive islands
        include: ['**/components/**/*'],
    }), tailwind()],
    output: 'server',
    adapter: vercel(),
    vite: {
        optimizeDeps: {
            exclude: ['convex'],
        },
    },
});