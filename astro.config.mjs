import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://abilsudarman.my.id',
  output: 'static',
  integrations: [sitemap()],
});
