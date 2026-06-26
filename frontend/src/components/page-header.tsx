import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/motion/reveal';

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Container className="py-16 md:py-20">
      <Reveal>
        <h1 className="font-display text-4xl font-bold text-primary md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-muted">{subtitle}</p>}
      </Reveal>
    </Container>
  );
}
