/**
 * Favorite controller: bind to the authenticated user, scope reads/deletes
 * to the owner so users can only touch their own favorites.
 */
import { factories } from '@strapi/strapi';
import { localeSafeConnect, relDocId } from '../../../utils/localized-relation';

export default factories.createCoreController('api::favorite.favorite', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const data = (ctx.request.body?.data ?? {}) as Record<string, unknown>;
    const payload: Record<string, unknown> = { user: { connect: [user.documentId] } };
    // The favorited target (route/event/location/article) is localized; connect
    // it against a locale that exists so single-locale content still works.
    for (const key of ['route', 'event', 'location', 'article'] as const) {
      if (data[key]) {
        const conn = await localeSafeConnect(strapi, `api::${key}.${key}`, relDocId(data[key]));
        if (conn) payload[key] = conn;
      }
    }
    const created = await strapi.documents('api::favorite.favorite').create({
      data: payload as never,
    });
    return { data: created };
  },

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    ctx.query = {
      ...ctx.query,
      filters: { ...(ctx.query.filters as object), user: { documentId: user.documentId } },
    };
    return super.find(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const { id } = ctx.params;
    const entry = await strapi.documents('api::favorite.favorite').findOne({
      documentId: id,
      populate: ['user'],
    });
    if (!entry || (entry.user as { id?: number } | null)?.id !== user.id) {
      return ctx.forbidden();
    }
    return super.delete(ctx);
  },
}));
