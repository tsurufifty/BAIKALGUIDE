/**
 * Favorite controller: bind to the authenticated user, scope reads/deletes
 * to the owner so users can only touch their own favorites.
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::favorite.favorite', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const data = (ctx.request.body?.data ?? {}) as Record<string, unknown>;
    const created = await strapi.documents('api::favorite.favorite').create({
      data: { ...data, user: { connect: [user.documentId] } } as never,
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
