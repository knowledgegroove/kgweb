import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Container, Section, Kicker } from "@/components/ui/Container";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/Button";
import { GlowCard } from "@/components/ui/spotlight-card";
import { projects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Projects",
  description: "Other projects built by Ishaan Garg, outside of the Knowledge Groove ecosystem.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        index="IV"
        title="Other things I've built."
        description="Knowledge Groove is one part of a bigger habit of building. Here's a look at some of the other projects I've worked on."
      />

      <Section className="pt-14 md:pt-16">
        <Container>
          <RevealGroup className="grid gap-6 md:grid-cols-2">
            {projects.map((p, i) => {
              const card = (
                <GlowCard customSize glowColor="rust" className="flex h-full flex-col p-8">
                  <span className="numeral text-sm text-navy">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="mt-4 font-display text-2xl text-foreground md:text-3xl">{p.name}</h2>
                  <p className="mt-3 flex-1 text-base leading-relaxed text-muted">{p.description}</p>
                  <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {p.tags.map((tag) => (
                        <span key={tag} className="kicker !text-muted-dim">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {p.href && (
                      <span className="link-underline inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                        View project
                        <ArrowUpRight size={14} />
                      </span>
                    )}
                  </div>
                </GlowCard>
              );

              return (
                <Reveal key={p.name}>
                  {p.href ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring block h-full"
                      aria-label={`View ${p.name}`}
                    >
                      {card}
                    </a>
                  ) : (
                    card
                  )}
                </Reveal>
              );
            })}
          </RevealGroup>

          <Reveal className="mt-8 flex flex-col items-start gap-6 border border-dashed border-border-strong p-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-xl text-foreground">More on the way</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                This portfolio grows alongside Knowledge Groove — check back for what&apos;s next,
                or reach out if you want to build something together.
              </p>
            </div>
            <Button href="/contact" variant="secondary" className="shrink-0">
              Let&apos;s talk
              <ArrowRight size={16} />
            </Button>
          </Reveal>
        </Container>
      </Section>

      <Section className="border-t border-border bg-background-alt pb-28">
        <Container>
          <Reveal className="max-w-2xl">
            <Kicker>Why I build</Kicker>
            <p className="mt-6 font-display text-2xl italic leading-snug text-foreground md:text-3xl">
              Every project starts the same way: a question I couldn&apos;t stop thinking about.
            </p>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
