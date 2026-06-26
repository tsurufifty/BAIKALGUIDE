import Image from 'next/image';
import { getMediaUrl } from '@/lib/api';
import type { StrapiMedia } from '@/lib/types';

export function Gallery({ images }: { images?: StrapiMedia[] | null }) {
  const items = (images ?? []).map((m) => ({ media: m, url: getMediaUrl(m) })).filter((i) => i.url);
  if (items.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ media, url }) => (
        <div
          key={media.documentId}
          className="relative aspect-[4/3] overflow-hidden rounded-card bg-secondary/10"
        >
          <Image
            src={url as string}
            alt={media.alternativeText ?? ''}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}
