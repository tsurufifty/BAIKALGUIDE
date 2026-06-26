/**
 * Restrict sign-up to Russian mail providers (Mail.ru group + Yandex).
 * Wraps the users-permissions register controller and rejects other domains
 * before the account is created. Login is unaffected.
 */

const ALLOWED_DOMAINS = new Set([
  // Mail.ru group
  'mail.ru',
  'bk.ru',
  'list.ru',
  'inbox.ru',
  'internet.ru',
  // Yandex
  'yandex.ru',
  'ya.ru',
  'yandex.com',
]);

function isAllowedEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const at = email.lastIndexOf('@');
  if (at < 0) return false;
  return ALLOWED_DOMAINS.has(email.slice(at + 1).trim().toLowerCase());
}

export default (plugin) => {
  const originalRegister = plugin.controllers.auth.register;

  plugin.controllers.auth.register = async (ctx) => {
    if (!isAllowedEmail(ctx.request.body?.email)) {
      return ctx.badRequest('email_not_allowed', { reason: 'email_not_allowed' });
    }
    return originalRegister(ctx);
  };

  return plugin;
};
