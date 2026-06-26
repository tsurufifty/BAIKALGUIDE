/** Strapi 5 content models (flattened REST shape). */

export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  url: string;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, StrapiMediaFormat> | null;
}

export interface GeoPoint {
  label?: string | null;
  longitude: number;
  latitude: number;
  zoom?: number | null;
}

export interface SeoComponent {
  metaTitle: string;
  metaDescription: string;
  keywords?: string | null;
  canonicalURL?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: StrapiMedia | null;
  twitterCard?: 'summary' | 'summary_large_image' | null;
  schemaType?: string | null;
  structuredData?: Record<string, unknown> | null;
  faq?: { id: number; question: string; answer: string }[] | null;
}

/** Strapi "blocks" rich-text node (minimal shape). */
export interface BlockNode {
  type: string;
  children?: { text?: string; type?: string }[];
  [key: string]: unknown;
}

export type Difficulty = 'easy' | 'moderate' | 'hard' | 'expert';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all_year';
export type ActivityType = 'active' | 'culture' | 'nature' | 'gastronomy' | 'relax';

export interface Rating {
  id: number;
  documentId: string;
  value: number;
}
export type LocationCategory =
  | 'nature'
  | 'culture'
  | 'gastronomy'
  | 'viewpoint'
  | 'lodging'
  | 'transport'
  | 'other';

interface BaseEntry {
  id: number;
  documentId: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface RouteEntry extends BaseEntry {
  title: string;
  slug: string;
  description?: BlockNode[] | null;
  duration?: string | null;
  durationDays?: number | null;
  activityType?: ActivityType | null;
  logistics?: BlockNode[] | null;
  season: Season;
  difficulty: Difficulty;
  price?: number | null;
  cover?: StrapiMedia | null;
  gallery?: StrapiMedia[] | null;
  coordinates?: GeoPoint[] | null;
  ratings?: Rating[] | null;
  seo?: SeoComponent | null;
}

export interface EventEntry extends BaseEntry {
  title: string;
  slug: string;
  date: string;
  endDate?: string | null;
  venue?: string | null;
  description?: BlockNode[] | null;
  image?: StrapiMedia | null;
  cover?: StrapiMedia | null;
  coordinates?: GeoPoint | null;
  seo?: SeoComponent | null;
}

export interface LocationEntry extends BaseEntry {
  title: string;
  slug: string;
  description?: BlockNode[] | null;
  category: LocationCategory;
  coordinates: GeoPoint;
  cover?: StrapiMedia | null;
  gallery?: StrapiMedia[] | null;
  seo?: SeoComponent | null;
}

export interface ArtistEntry extends BaseEntry {
  name: string;
  slug: string;
  genre?: string | null;
  biography?: BlockNode[] | null;
  avatar?: StrapiMedia | null;
  cover?: StrapiMedia | null;
  seo?: SeoComponent | null;
}

export interface ArticleEntry extends BaseEntry {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: BlockNode[] | null;
  category: 'interview' | 'selection' | 'review' | 'news' | 'story';
  publishedDate?: string | null;
  cover?: StrapiMedia | null;
  artists?: ArtistEntry[] | null;
  seo?: SeoComponent | null;
}
