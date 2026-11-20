import { defineConfig } from 'astro/config';
import { deploymentConfig } from './deployment.config.mjs';

export default defineConfig({
  ...deploymentConfig(),
  trailingSlash: 'always',
  output: 'static',
  markdown: { shikiConfig: { theme: 'solarized-light' } },
});
