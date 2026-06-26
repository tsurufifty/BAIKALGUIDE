import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/motion/reveal';

export interface InfoSection {
  title: string;
  body: string;
}

/** Renders a stack of titled content cards from an i18n `sections` array.
 *  Shared by the service pages (getting there, transport, safety, partners). */
export function InfoSections({ sections }: { sections: InfoSection[] }) {
  return (
    <Container className="max-w-3xl space-y-6 pb-24">
      {sections.map((s, i) => (
        <Reveal key={i} delay={i * 0.05}>
          <section className="rounded-card bg-white p-7 shadow-sm ring-1 ring-foreground/5">
            <h2 className="font-display text-xl font-semibold text-primary">{s.title}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-foreground/75">{s.body}</p>
          </section>
        </Reveal>
      ))}
    </Container>
  );
}
