import { getMediaUrl } from '@/lib/api';
import type { StrapiMedia } from '@/lib/types';
import { GalleryLightbox } from '@/components/gallery-lightbox';

export function Gallery({ images }: { images?: StrapiMedia[] | null }) {
  const items = (images ?? [])
    .map((m) => ({ url: getMediaUrl(m) ?? '', alt: m.alternativeText ?? '' }))
    .filter((i) => i.url);
  if (items.length === 0) return null;

  return <GalleryLightbox items={items} />;
}
