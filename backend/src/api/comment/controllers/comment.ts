/**
 * Comment controller: bind author, auto-publish unless the text hits the
 * profanity stop-list, and only expose approved comments through the public API.
 */
import { factories } from '@strapi/strapi';
import { containsProfanity } from '../../../utils/profanity';
import { localeSafeConnect, relDocId } from '../../../utils/localized-relation';

export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const data = (ctx.request.body?.data ?? {}) as Record<string, unknown>;

    // Stop-list: reject comments containing profanity.
    if (containsProfanity(String(data.content ?? ''))) {
      return ctx.badRequest('profanity', { reason: 'profanity' });
    }

    const payload: Record<string, unknown> = {
      content: data.content,
      user: { connect: [user.documentId] },
      approved: true,
    };
    // Connect the localized target (route/article) against a locale that
    // actually exists — content may be authored in ru only.
    for (const key of ['route', 'article'] as const) {
      if (data[key]) {
        const conn = await localeSafeConnect(strapi, `api::${key}.${key}`, relDocId(data[key]));
        if (conn) payload[key] = conn;
      }
    }

    const created = await strapi.documents('api::comment.comment').create({
      data: payload as never,
    });
    return { data: created };
  },

  async find(ctx) {
    // Fetch via Document Service so we control the output shape and can expose
    // the author's name/avatar (the default public sanitizer strips the `user`
    // relation to null).
    const filters = { ...(ctx.query.filters as object), approved: true };
    const sort = (ctx.query.sort as never) ?? 'createdAt:desc';

    const entries = (await strapi.documents('api::comment.comment').findMany({
      filters: filters as never,
      sort,
      populate: { user: { populate: { avatar: true } } } as never,
    })) as Array<{
      documentId: string;
      content: string;
      createdAt: string;
      user?: { username?: string; avatar?: { url?: string } | null } | null;
    }>;

    const data = entries.map((c) => ({
      documentId: c.documentId,
      content: c.content,
      createdAt: c.createdAt,
      user: c.user
        ? { username: c.user.username ?? null, avatar: c.user.avatar?.url ? { url: c.user.avatar.url } : null }
        : null,
    }));

    return { data };
  },
}));
