/**
 * Subscriber controller: public create only, idempotent by email — subscribing
 * twice with the same address returns success instead of creating a duplicate.
 * Reads are not exposed publicly (staff view the list in the Strapi admin).
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::subscriber.subscriber', ({ strapi }) => ({
  async create(ctx) {
    ctx.request.body = ctx.request.body ?? {};
    const data = (ctx.request.body.data ?? {}) as { email?: string; source?: string };
    const email = (data.email ?? '').trim().toLowerCase();
    if (!email) return ctx.badRequest('email is required');

    const existing = await strapi.documents('api::subscriber.subscriber').findFirst({
      filters: { email } as never,
    });
    if (existing) return { data: existing };

    ctx.request.body.data = { ...data, email };
    return super.create(ctx);
  },
}));
