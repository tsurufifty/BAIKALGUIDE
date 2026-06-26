import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { Container } from '@/components/ui/container';
import { AuthForm } from '@/components/auth/auth-form';

type Props = { params: Promise<{ locale: string }> };

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Auth');
  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <Container className="pb-24">
        <AuthForm />
      </Container>
    </>
  );
}
