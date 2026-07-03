/**
 * Locale-safe relation helpers.
 *
 * Comments, favorites and ratings are NOT localized, but they link to content
 * that IS localized (routes, articles, events, locations). When such content is
 * authored in a single locale (e.g. ru only) and we connect it from a
 * non-localized entry, Strapi resolves the relation against the i18n *default*
 * locale (en) and throws:
 *
 *   ValidationError: Document with id "…", locale "en" not found
 *
 * These helpers resolve a locale that actually exists for the target document
 * and build the `connect` payload against it.
 */
import type { Core } from '@strapi/strapi';

/**
 * Normalise the various shapes a relation payload can arrive in:
 *   "abc"                          -> "abc"
 *   { connect: ["abc"] }           -> "abc"
 *   { connect: [{ documentId }] }  -> documentId
 */
export function relDocId(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  const connect = (value as { connect?: unknown[] }).connect;
  const first = Array.isArray(connect) ? connect[0] : undefined;
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object') return (first as { documentId?: string }).documentId;
  return undefined;
}

/**
 * Build a `connect` payload targeting a locale that exists for `documentId`.
 * Falls back to a plain documentId connect (original behaviour) if the target
 * can't be resolved.
 */
export async function localeSafeConnect(
  strapi: Core.Strapi,
  uid: string,
  documentId: string | undefined,
): Promise<{ connect: Array<{ documentId: string; locale?: string }> } | undefined> {
  if (!documentId) return undefined;
  try {
    const row = (await strapi.db
      .query(uid)
      .findOne({ where: { documentId } })) as { documentId?: string; locale?: string } | null;
    if (row?.documentId) {
      return { connect: [{ documentId: row.documentId, locale: row.locale ?? undefined }] };
    }
  } catch (err) {
    strapi.log.warn(
      `[localeSafeConnect] could not resolve locale for ${uid} ${documentId}: ${(err as Error).message}`,
    );
  }
  return { connect: [{ documentId }] };
}
