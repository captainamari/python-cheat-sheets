import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://captainamari.github.io',
  base: '/python-cheat-sheets',
  trailingSlash: 'always',
  output: 'static',
  markdown: { shikiConfig: { theme: 'solarized-light' } },
});
