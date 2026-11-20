/** Keep the build, link checks and browser tests on the same deployment base. */
export function deploymentConfig(env = process.env) {
  const vercel = env.DEPLOY_TARGET === 'vercel' || env.VERCEL === '1';
  const domain = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL;
  const site = vercel
    ? env.SITE_URL || (domain ? `https://${domain}` : undefined)
    : 'https://captainamari.github.io';
  if (!site) {
    throw new Error('Vercel 构建需要系统域名变量，或设置 SITE_URL 为完整网站地址。');
  }
  const parsed = new URL(site);
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.pathname !== '/' ||
    parsed.search ||
    parsed.hash ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error('SITE_URL 必须是 http(s) 域名地址，不包含子路径、查询或认证信息。');
  }
  return { site: parsed.origin, base: vercel ? '/' : '/python-cheat-sheets/' };
}
