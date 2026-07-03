/**
 * Rating controller: bind to the authenticated user and enforce one rating
 * per user per route — re-rating updates the existing value instead of
 * creating a duplicate. Reads are public (used to compute route averages).
 */
import { factories } from '@strapi/strapi';
import { localeSafeConnect } from '../../../utils/localized-relation';

export default factories.createCoreController('api::rating.rating', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    ctx.request.body = ctx.request.body ?? {};
    const data = (ctx.request.body.data ?? {}) as { route?: string; value?: number };
    const routeDocId = data.route;
    if (!routeDocId) return ctx.badRequest('route is required');

    // One rating per user per route — update if it already exists.
    const existing = await strapi.documents('api::rating.rating').findFirst({
      filters: {
        user: { documentId: user.documentId },
        route: { documentId: routeDocId },
      } as never,
    });

    if (existing) {
      const updated = await strapi.documents('api::rating.rating').update({
        documentId: existing.documentId,
        data: { value: data.value } as never,
      });
      return { data: updated };
    }

    const routeConnect = await localeSafeConnect(strapi, 'api::route.route', routeDocId);
    const created = await strapi.documents('api::rating.rating').create({
      data: {
        value: data.value,
        route: routeConnect,
        user: { connect: [user.documentId] },
      } as never,
    });
    return { data: created };
  },
}));
