import type { Metadata } from "next";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container, Section, Kicker } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/Button";
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
          <div className="border-t border-border-strong">
            {projects.map((p, i) => (
              <Reveal key={p.name}>
                <div className="grid gap-6 border-b border-border-strong py-12 md:grid-cols-[3rem_1fr_auto] md:items-start">
                  <span className="numeral text-sm text-muted-dim">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 className="font-display text-3xl text-foreground">{p.name}</h2>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">{p.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:items-end md:text-right">
                    {p.tags.map((tag) => (
                      <span key={tag} className="kicker !text-muted-dim">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14 flex flex-col items-start gap-6 border border-dashed border-border-strong p-10 md:flex-row md:items-center md:justify-between">
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
