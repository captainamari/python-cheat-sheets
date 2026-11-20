import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deploymentConfig } from '../deployment.config.mjs';

test('Pages retains its subpath; Vercel previews use the production canonical domain', () => {
  assert.deepEqual(deploymentConfig({}), {
    site: 'https://captainamari.github.io',
    base: '/python-cheat-sheets/',
  });
  assert.deepEqual(
    deploymentConfig({
      VERCEL: '1',
      VERCEL_PROJECT_PRODUCTION_URL: 'learn.example.com',
      VERCEL_URL: 'preview.example.com',
    }),
    {
      site: 'https://learn.example.com',
      base: '/',
    },
  );
  assert.deepEqual(
    deploymentConfig({
      DEPLOY_TARGET: 'vercel',
      SITE_URL: 'https://custom.example.com/',
      VERCEL_URL: 'preview.example.com',
    }),
    {
      site: 'https://custom.example.com',
      base: '/',
    },
  );
  assert.equal(
    deploymentConfig({ VERCEL: '1', VERCEL_URL: 'preview.example.com' }).site,
    'https://preview.example.com',
  );
});

test('Vercel cannot silently publish with the Pages domain or an invalid origin', () => {
  assert.throws(() => deploymentConfig({ DEPLOY_TARGET: 'vercel' }), /SITE_URL/);
  for (const site of [
    'https://example.com/sub/',
    'https://example.com/?q=1',
    'https://example.com/#x',
    'https://user:pass@example.com',
    'file:///tmp/',
  ]) {
    assert.throws(() => deploymentConfig({ DEPLOY_TARGET: 'vercel', SITE_URL: site }), /SITE_URL/);
  }
});
