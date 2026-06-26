import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getMediaUrl } from '@/lib/api';
import type { ArticleEntry } from '@/lib/types';

export function ArticleCard({ article }: { article: ArticleEntry }) {
  const tc = useTranslations('ArticleCategory');
  const cover = getMediaUrl(article.cover);

  return (
    <Link
      href={`/music/${article.slug}`}
      className="group block overflow-hidden rounded-card bg-white shadow-sm ring-1 ring-foreground/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary/10">
        {cover ? (
          <Image
            src={cover}
            alt={article.cover?.alternativeText ?? article.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-accent/20 to-primary/20" />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 text-xs font-medium text-accent backdrop-blur">
          {tc(article.category)}
        </span>
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-semibold leading-snug text-foreground">
          {article.title}
        </h3>
        {article.excerpt && <p className="mt-3 line-clamp-2 text-sm text-muted">{article.excerpt}</p>}
      </div>
    </Link>
  );
}
