import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Container } from '@/components/ui/container';
import { BlockContent } from '@/components/block-content';
import { ArtistCard } from '@/components/artist-card';
import { ShareButtons } from '@/components/share-buttons';
import { Comments } from '@/components/comments';
import { JsonLd } from '@/components/json-ld';
import { articleJsonLd, faqJsonLd, SITE_URL } from '@/lib/seo';
import { getArticleBySlug, getMediaUrl } from '@/lib/api';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(locale as Locale, slug);
  if (!article) return {};
  return {
    title: article.seo?.metaTitle ?? article.title,
    description: article.seo?.metaDescription ?? article.excerpt ?? undefined,
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = await getArticleBySlug(locale as Locale, slug);
  if (!article) notFound();

  const t = await getTranslations('ArticleDetail');
  const tc = await getTranslations('ArticleCategory');
  const cover = getMediaUrl(article.cover);
  const url = `${SITE_URL}/${locale}/music/${article.slug}`;
  const faq = faqJsonLd(article.seo);

  return (
    <article>
      <JsonLd data={articleJsonLd(article, url)} />
      {faq && <JsonLd data={faq} />}

      <Container className="max-w-3xl pt-16">
        <span className="text-sm font-semibold uppercase tracking-wide text-accent">
          {tc(article.category)}
        </span>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-primary md:text-5xl">
          {article.title}
        </h1>
        {article.excerpt && <p className="mt-4 text-lg text-muted">{article.excerpt}</p>}
      </Container>

      {cover && (
        <Container className="max-w-4xl py-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-secondary/10">
            <Image src={cover} alt={article.title} fill priority sizes="100vw" className="object-cover" />
          </div>
        </Container>
      )}

      <Container className="max-w-3xl pb-16">
        <BlockContent content={article.content} />

        {article.artists && article.artists.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 font-display text-xl font-semibold text-primary">{t('featuring')}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {article.artists.map((a) => <ArtistCard key={a.documentId} artist={a} />)}
            </div>
          </section>
        )}

        <div className="mt-12 border-t border-foreground/10 pt-8">
          <ShareButtons url={url} title={article.title} />
        </div>

        <Comments target="article" itemId={article.documentId} />
      </Container>
    </article>
  );
}

export const revalidate = 300;
