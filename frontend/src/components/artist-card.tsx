import Image from 'next/image';
import { getMediaUrl } from '@/lib/api';
import type { ArtistEntry } from '@/lib/types';

export function ArtistCard({ artist }: { artist: ArtistEntry }) {
  const avatar = getMediaUrl(artist.avatar);
  return (
    <div className="flex items-center gap-4 rounded-card bg-white p-4 shadow-sm ring-1 ring-foreground/5">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-secondary/15">
        {avatar ? (
          <Image src={avatar} alt={artist.name} fill sizes="64px" className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center font-display text-lg font-bold text-primary/50">
            {artist.name.charAt(0)}
          </div>
        )}
      </div>
      <div>
        <p className="font-display font-semibold text-foreground">{artist.name}</p>
        {artist.genre && <p className="text-sm text-muted">{artist.genre}</p>}
      </div>
    </div>
  );
}
