/**
 * Feedback controller: public can only create. Force `handled = false` on
 * create so a client cannot pre-mark submissions as handled. Reads are not
 * exposed publicly (no find/findOne permission granted) — staff view them in
 * the Strapi admin.
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::feedback.feedback', () => ({
  async create(ctx) {
    ctx.request.body = ctx.request.body ?? {};
    ctx.request.body.data = {
      ...(ctx.request.body.data ?? {}),
      handled: false,
    };
    return super.create(ctx);
  },
}));
