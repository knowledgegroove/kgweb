import type { Metadata } from "next";
import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import { Container, Section, Kicker } from "@/components/ui/Container";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/Button";
import { workshops } from "@/lib/data";

export const metadata: Metadata = {
  title: "Academy",
  description:
    "Hands-on AI and English proficiency workshops from Knowledge Groove Academy, built to build real, usable skill.",
};

const steps = [
  {
    n: "01",
    title: "Reach out",
    description: "Send a note through the contact page with which workshop track interests you.",
  },
  {
    n: "02",
    title: "Get scheduled",
    description: "Sessions are kept small and hands-on, so timing is coordinated directly with participants.",
  },
  {
    n: "03",
    title: "Show up & practice",
    description: "Every session is built around doing, not just watching: you leave with something usable.",
  },
];

export default function AcademyPage() {
  return (
    <>
      <PageHero
        eyebrow="Knowledge Groove Academy"
        index="II"
        title="Learn by doing, not just listening."
        description="The Academy is where Knowledge Groove gets hands-on: live workshops built around the skills that matter most right now, taught in small, practical sessions."
      >
        <Button href="/contact">
          Reserve a spot
          <ArrowRight size={16} />
        </Button>
      </PageHero>

      <Section className="pt-14 md:pt-16">
        <Container>
          <div className="border-t border-border-strong">
            {workshops.map((w, i) => (
              <Reveal key={w.title}>
                <div className="grid gap-8 border-b border-border-strong py-12 md:grid-cols-[3rem_1fr_1fr]">
                  <span className="numeral text-sm text-navy">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 className="font-display text-3xl text-foreground">{w.title}</h2>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-muted">{w.summary}</p>
                    <div className="mt-6">
                      <Button href="/contact" variant="secondary">
                        Ask about this workshop
                      </Button>
                    </div>
                  </div>
                  <ul className="space-y-4 border-t border-border pt-6 md:border-t-0 md:pt-0">
                    {w.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-muted">
                        <Check size={15} weight="bold" className="mt-1 shrink-0 text-accent" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border bg-background-alt">
        <Container>
          <Reveal className="max-w-xl">
            <Kicker>How it works</Kicker>
            <h2 className="mt-6 text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
              Small groups. Real practice. No fluff.
            </h2>
          </Reveal>

          <RevealGroup className="mt-12 grid gap-px overflow-hidden border border-border-strong md:grid-cols-3">
            {steps.map((step) => (
              <Reveal key={step.n}>
                <div className="h-full bg-surface p-8">
                  <span className="numeral text-sm text-accent">{step.n}</span>
                  <h3 className="mt-3 font-display text-xl text-foreground">{step.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </RevealGroup>
        </Container>
      </Section>
    </>
  );
}
