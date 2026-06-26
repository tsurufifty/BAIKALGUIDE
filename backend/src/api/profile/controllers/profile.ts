/**
 * Profile controller: lets an authenticated user read and update ONLY their
 * own profile (username, email, avatar). Scoped to ctx.state.user — no id is
 * taken from the request, so users can't edit other accounts.
 */

type AnyUser = Record<string, unknown> | null;

function safe(user: AnyUser) {
  if (!user) return null;
  const {
    password,
    resetPasswordToken,
    confirmationToken,
    provider,
    ...rest
  } = user as Record<string, unknown>;
  return rest;
}

export default {
  async me(ctx) {
    const u = ctx.state.user;
    if (!u) return ctx.unauthorized();
    const full = await strapi.documents('plugin::users-permissions.user').findOne({
      documentId: u.documentId,
      populate: ['avatar'],
    });
    return { data: safe(full as AnyUser) };
  },

  async update(ctx) {
    const u = ctx.state.user;
    if (!u) return ctx.unauthorized();

    const body = (ctx.request.body?.data ?? ctx.request.body ?? {}) as Record<string, unknown>;
    const data: Record<string, unknown> = {};

    if (typeof body.username === 'string' && body.username.trim()) {
      data.username = body.username.trim();
    }
    if (typeof body.email === 'string' && body.email.trim()) {
      data.email = body.email.trim().toLowerCase();
    }
    // avatar: a media file id (number) to set, or null to clear.
    if ('avatar' in body) {
      data.avatar = body.avatar ?? null;
    }

    try {
      const updated = await strapi.documents('plugin::users-permissions.user').update({
        documentId: u.documentId,
        data: data as never,
        populate: ['avatar'],
      });
      return { data: safe(updated as AnyUser) };
    } catch (err) {
      // e.g. email already taken
      return ctx.badRequest('Profile update failed', { error: (err as Error).message });
    }
  },
};
