import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://abilsudarman.my.id',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'never' },
  markdown: { syntaxHighlight: false },
  security: {
    csp: {
      scriptDirective: { resources: ["'self'", 'https://open.spotify.com'] },
      styleDirective: {
        resources: [
          { resource: "'self'", kind: 'element' },
          { resource: "'unsafe-inline'", kind: 'attribute' },
        ],
      },
    },
  },
  integrations: [react(), sitemap()],
});
