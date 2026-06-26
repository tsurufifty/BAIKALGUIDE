import type { Core } from '@strapi/strapi';
import { locations, routes, events, artists, articles } from './data';

type DocId = string;

/**
 * Creates a published entry in `ru`, then adds the `en` localization
 * to the same document. Returns the documentId.
 */
async function createLocalized(
  strapi: Core.Strapi,
  uid: string,
  ruData: Record<string, unknown>,
  enData: Record<string, unknown>,
): Promise<DocId> {
  const created = await strapi.documents(uid as never).create({
    data: ruData as never,
    locale: 'ru',
    status: 'published',
  });

  const documentId = (created as { documentId: DocId }).documentId;

  await strapi.documents(uid as never).update({
    documentId,
    locale: 'en',
    data: enData as never,
    status: 'published',
  });

  return documentId;
}

async function count(strapi: Core.Strapi, uid: string): Promise<number> {
  return strapi.db.query(uid).count({});
}

export async function seedDemoContent(strapi: Core.Strapi): Promise<void> {
  // Guard: only seed an empty store.
  const existing = await count(strapi, 'api::location.location');
  if (existing > 0) {
    strapi.log.info('[seed] content already present, skipping');
    return;
  }

  strapi.log.info('[seed] seeding demo content (ru + en)…');

  const locationIds = new Map<string, DocId>();
  const artistIds = new Map<string, DocId>();

  for (const loc of locations) {
    try {
      const id = await createLocalized(
        strapi,
        'api::location.location',
        { title: loc.ru.title, description: loc.ru.description, category: loc.category, coordinates: loc.coordinates },
        { title: loc.en.title, description: loc.en.description },
      );
      locationIds.set(loc.key, id);
    } catch (err) {
      strapi.log.error(`[seed] location "${loc.key}": ${(err as Error).message}`);
    }
  }

  for (const artist of artists) {
    try {
      const id = await createLocalized(
        strapi,
        'api::artist.artist',
        { name: artist.ru.name, genre: artist.ru.genre, biography: artist.ru.biography },
        { name: artist.en.name, genre: artist.en.genre, biography: artist.en.biography },
      );
      artistIds.set(artist.key, id);
    } catch (err) {
      strapi.log.error(`[seed] artist "${artist.key}": ${(err as Error).message}`);
    }
  }

  for (const route of routes) {
    try {
      const connect = route.locationKeys
        .map((k) => locationIds.get(k))
        .filter((id): id is DocId => Boolean(id))
        .map((documentId) => ({ documentId }));
      await createLocalized(
        strapi,
        'api::route.route',
        {
          title: route.ru.title,
          description: route.ru.description,
          duration: route.ru.duration,
          durationDays: route.durationDays,
          activityType: route.activityType,
          logistics: route.ru.logistics,
          season: route.season,
          difficulty: route.difficulty,
          price: route.price,
          coordinates: route.coordinates,
          locations: { connect },
        },
        {
          title: route.en.title,
          description: route.en.description,
          duration: route.en.duration,
          logistics: route.en.logistics,
        },
      );
    } catch (err) {
      strapi.log.error(`[seed] route "${route.key}": ${(err as Error).message}`);
    }
  }

  for (const event of events) {
    try {
      const locId = locationIds.get(event.locationKey);
      await createLocalized(
        strapi,
        'api::event.event',
        {
          title: event.ru.title,
          venue: event.ru.venue,
          description: event.ru.description,
          date: event.date,
          coordinates: event.coordinates,
          ...(locId ? { location: { connect: [{ documentId: locId }] } } : {}),
        },
        { title: event.en.title, venue: event.en.venue, description: event.en.description },
      );
    } catch (err) {
      strapi.log.error(`[seed] event "${event.key}": ${(err as Error).message}`);
    }
  }

  for (const article of articles) {
    try {
      const connect = article.artistKeys
        .map((k) => artistIds.get(k))
        .filter((id): id is DocId => Boolean(id))
        .map((documentId) => ({ documentId }));
      await createLocalized(
        strapi,
        'api::article.article',
        {
          title: article.ru.title,
          excerpt: article.ru.excerpt,
          content: article.ru.content,
          category: article.category,
          publishedDate: article.publishedDate,
          artists: { connect },
        },
        { title: article.en.title, excerpt: article.en.excerpt, content: article.en.content },
      );
    } catch (err) {
      strapi.log.error(`[seed] article "${article.key}": ${(err as Error).message}`);
    }
  }

  strapi.log.info('[seed] done');
}
