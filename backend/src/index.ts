import type { Core } from '@strapi/strapi';
import { seedDemoContent } from './seed/seed';

/**
 * Bootstrap:
 *  1. Ensure locales en + ru exist.
 *  2. Grant Public read access + Authenticated read/create to the REST API
 *     (Strapi gives new content types ZERO public permissions by default).
 *  3. Optionally seed demo content when SEED_DATA=true.
 *
 * Admin-panel roles (Admin / Editor / Moderator) are configured in the panel —
 * see PROJECT_MEMORY.md for the permission matrix.
 */

const REQUIRED_LOCALES = [
  { code: 'en', name: 'English (en)' },
  { code: 'ru', name: 'Русский (ru)' },
];

const READ_ACTIONS = ['find', 'findOne'];
const CONTENT_COLLECTIONS = ['route', 'event', 'location', 'article', 'artist'];

async function ensureLocales(strapi: Core.Strapi): Promise<void> {
  const localeService = strapi.plugin('i18n').service('locales');
  const existing = await localeService.find();
  const codes = existing.map((l: { code: string }) => l.code);
  for (const locale of REQUIRED_LOCALES) {
    if (!codes.includes(locale.code)) {
      await localeService.create(locale);
      strapi.log.info(`[i18n] created locale: ${locale.code}`);
    }
  }
}

async function grant(
  strapi: Core.Strapi,
  roleType: 'public' | 'authenticated',
  actions: string[],
): Promise<void> {
  const role = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: roleType } });
  if (!role) return;

  for (const action of actions) {
    const exists = await strapi
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: role.id } });
    if (!exists) {
      await strapi
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: role.id } });
    }
  }
  strapi.log.info(`[bootstrap] ${roleType} permissions ensured (${actions.length})`);
}

function buildActions(collections: string[], actions: string[]): string[] {
  const result: string[] = [];
  for (const c of collections) {
    for (const a of actions) result.push(`api::${c}.${c}.${a}`);
  }
  return result;
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await ensureLocales(strapi);

      // Public: read content + read (approved) comments + read ratings
      // (needed to compute route averages for anonymous visitors) + submit
      // feedback from the public contact form (create only).
      await grant(strapi, 'public', [
        ...buildActions(CONTENT_COLLECTIONS, READ_ACTIONS),
        ...buildActions(['comment'], READ_ACTIONS),
        ...buildActions(['rating'], READ_ACTIONS),
        ...buildActions(['feedback'], ['create']),
        ...buildActions(['subscriber'], ['create']),
      ]);

      // Authenticated: read content + read/create comments + manage favorites
      // + submit ratings. Ownership of favorites/ratings is enforced in their
      // controllers (reads/deletes scoped to the current user).
      await grant(strapi, 'authenticated', [
        ...buildActions(CONTENT_COLLECTIONS, READ_ACTIONS),
        ...buildActions(['comment'], ['find', 'findOne', 'create']),
        ...buildActions(['favorite'], ['find', 'findOne', 'create', 'update', 'delete']),
        ...buildActions(['rating'], ['find', 'findOne', 'create']),
        // Self-service profile + avatar upload.
        'api::profile.profile.me',
        'api::profile.profile.update',
        'plugin::upload.content-api.upload',
      ]);
    } catch (err) {
      strapi.log.error(`[bootstrap] setup failed (non-fatal): ${(err as Error).message}`);
    }

    if (process.env.SEED_DATA === 'true') {
      try {
        await seedDemoContent(strapi);
      } catch (err) {
        strapi.log.error(`[seed] failed (non-fatal): ${(err as Error).message}`);
      }
    }
  },
};
