import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { altLanguages } from '@/lib/seo';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/page-header';
import { Reveal } from '@/components/motion/reveal';
import { ArticleCard } from '@/components/article-card';
import { ArtistCard } from '@/components/artist-card';
import { getArticles, getArtists } from '@/lib/api';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'MusicPage' });
  return { title: t('title'), description: t('subtitle'), alternates: altLanguages('/music') };
}

export default async function MusicPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('MusicPage');
  const [articles, artists] = await Promise.all([
    getArticles(locale as Locale),
    getArtists(locale as Locale),
  ]);

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <Container className="pb-12">
        <h2 className="mb-8 font-display text-2xl font-semibold text-primary">{t('articlesHeading')}</h2>
        {articles.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <Reveal key={a.documentId} delay={i * 0.06}>
                <ArticleCard article={a} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Empty text={t('emptyArticles')} />
        )}
      </Container>

      <Container className="pb-20">
        <h2 className="mb-8 font-display text-2xl font-semibold text-primary">{t('artistsHeading')}</h2>
        {artists.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((a) => <ArtistCard key={a.documentId} artist={a} />)}
          </div>
        ) : (
          <Empty text={t('emptyArtists')} />
        )}
      </Container>
    </>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-card border border-dashed border-foreground/15 bg-white/40 px-6 py-16 text-center text-muted">
      {text}
    </div>
  );
}

export const revalidate = 300;
